import { vitest, describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import Swup, { DelegateEvent, Visit } from 'swup';
import SwupFormsPlugin from '../../src/index.js';

// vitest.mock('../../src/forms.js');
// vitest.mock('../../src/keys.js');

const createForm = (html: string) => {
	const form = new window.DOMParser().parseFromString(html, 'text/html').querySelector('form')!;
	document.body.appendChild(form);
	return form;
};

const submitForm = (form: HTMLFormElement, submitter?: HTMLButtonElement | null, key?: string) => {
	if (key) {
		document.dispatchEvent(new KeyboardEvent('keydown', { key }));
	}
	if (submitter) {
		submitter.click();
	} else {
		form.dispatchEvent(new SubmitEvent('submit', { bubbles: true }));
	}
	if (key) {
		document.dispatchEvent(new KeyboardEvent('keyup', { key }));
	}
}

describe('SwupFormsPlugin', () => {
	let swup: Swup;
	let plugin: SwupFormsPlugin;
	let visit: Visit;

	beforeEach(() => {
		swup = new Swup();
		plugin = new SwupFormsPlugin();

		// @ts-ignore - createVisit is marked internal
		visit = swup.createVisit({ url: '/' });
		visit.to.document = new window.DOMParser().parseFromString(
			'<html><head></head><body></body></html>',
			'text/html'
		);
	});

	afterEach(() => {
		swup.unuse(plugin);
		swup.destroy();
	});

	it('does not call beforeFormSubmit for ignored forms', async () => {
		const spy = vitest.spyOn(plugin, 'beforeFormSubmit').mockImplementation(() => {});
		swup.use(plugin);

		const form = createForm('<form action="/path"></form>');
		submitForm(form);

		expect(spy).not.toHaveBeenCalled();
	});

	it('calls beforeFormSubmit for swup forms', async () => {
		const spy = vitest.spyOn(plugin, 'beforeFormSubmit').mockImplementation(() => {});
		swup.use(plugin);

		const form = createForm('<form action="/path" data-swup-form></form>');
		submitForm(form);

		expect(spy).toHaveBeenCalledWith(expect.objectContaining({ delegateTarget: form }));
	});

	it('receives the submitter in beforeFormSubmit', async () => {
		const spy = vitest.spyOn(plugin, 'beforeFormSubmit').mockImplementation(() => {});
		swup.use(plugin);

		const form = createForm('<form action="/path" data-swup-form><button type="submit"></button></form>');
		const submitter = form.querySelector('button');
		submitForm(form);
		expect(spy).toHaveBeenCalledWith(expect.not.objectContaining({ submitter }));
		submitForm(form, submitter);
		expect(spy).toHaveBeenCalledWith(expect.objectContaining({ submitter }));
	});

	it('calls the form:submit hook', async () => {
		swup.use(plugin);

		vitest.spyOn(plugin, 'submitForm').mockImplementation(() => {});

		const formHookSpy = vitest.fn();
		swup.hooks.on('form:submit', formHookSpy);

		const form = createForm('<form action="/path" data-swup-form></form>');
		submitForm(form);

		const expectedEvent = expect.objectContaining({ delegateTarget: form });

		const expectedVisit = expect.objectContaining({
			from: expect.objectContaining({ url: '/' }),
			to: expect.objectContaining({ url: '/path' }),
			trigger: expect.objectContaining({ el: form, event: expectedEvent })
		});

		const expectedArgs = expect.objectContaining({  el: form, event: expectedEvent });

		expect(formHookSpy).toHaveBeenCalledWith(expectedVisit, expectedArgs, undefined);
	});

	it('calls the form:submit:newtab hook for new-tab forms', async () => {
		swup.use(plugin);

		const formHookSpy = vitest.fn();
		const formHookNewTabSpy = vitest.fn();
		swup.hooks.on('form:submit', formHookSpy);
		swup.hooks.on('form:submit:newtab', formHookNewTabSpy);

		const form = createForm('<form action="/path" target="_blank" data-swup-form></form>');
		submitForm(form);

		const expectedEvent = expect.objectContaining({ delegateTarget: form });

		const expectedVisit = expect.objectContaining({
			from: expect.objectContaining({ url: '/' }),
			to: expect.objectContaining({ url: '/path' }),
			trigger: expect.objectContaining({ el: form, event: expectedEvent })
		});

		const expectedArgs = expect.objectContaining({  el: form, event: expectedEvent });

		expect(formHookSpy).not.toHaveBeenCalled();
		expect(formHookNewTabSpy).toHaveBeenCalledWith(expectedVisit, expectedArgs, undefined);
	});

	it('calls the form:submit:newtab hook when meta key is pressed', async () => {
		swup.use(plugin);

		const formHookSpy = vitest.fn();
		const formHookNewTabSpy = vitest.fn();
		swup.hooks.on('form:submit', formHookSpy);
		swup.hooks.on('form:submit:newtab', formHookNewTabSpy);

		const form = createForm('<form action="/path" data-swup-form></form>');
		submitForm(form, null, 'Control');

		const expectedEvent = expect.objectContaining({ delegateTarget: form });

		const expectedVisit = expect.objectContaining({
			from: expect.objectContaining({ url: '/' }),
			to: expect.objectContaining({ url: '/path' }),
			trigger: expect.objectContaining({ el: form, event: expectedEvent })
		});

		const expectedArgs = expect.objectContaining({  el: form, event: expectedEvent });

		expect(formHookSpy).not.toHaveBeenCalled();
		expect(formHookNewTabSpy).toHaveBeenCalledWith(expectedVisit, expectedArgs, undefined);
	});

	it('ignores forms targeted by swup.ignoreVisit', async () => {
		swup.use(plugin);

		const ignoreSpy = vitest.spyOn(swup, 'shouldIgnoreVisit').mockImplementation(() => true);

		const formHookSpy = vitest.fn();
		const formHookNewTabSpy = vitest.fn();
		swup.hooks.on('form:submit', formHookSpy);
		swup.hooks.on('form:submit:newtab', formHookNewTabSpy);

		const form = createForm('<form action="/path" data-swup-form><input type="hidden" name="a" value="b"></form>');
		submitForm(form);

		expect(formHookSpy).not.toHaveBeenCalled();
		expect(formHookNewTabSpy).not.toHaveBeenCalled();
		expect(ignoreSpy).toHaveBeenCalledWith(
			'http://localhost:3000/path?a=b',
			expect.objectContaining({ el: form })
		);
	});

	it('calls submitForm when submitting', async () => {
		swup.use(plugin);

		const submitSpy = vitest.spyOn(plugin, 'submitForm').mockImplementation(() => {});

		const form = createForm('<form action="/path" data-swup-form></form>');
		submitForm(form);

		expect(submitSpy).toHaveBeenCalledWith(expect.objectContaining({ delegateTarget: form }));
	});

	it('prevents default in submitForm', async () => {
		swup.use(plugin);

		const form = createForm('<form action="/path" data-swup-form></form>');
		const originalEvent = new SubmitEvent('submit', { cancelable: true });
		const event: DelegateEvent<SubmitEvent, HTMLFormElement> = { ...originalEvent, delegateTarget: form, preventDefault: vitest.fn() };
		vitest.spyOn(swup, 'navigate').mockImplementation(() => {});
		plugin.submitForm(event);

		expect(event.preventDefault).toHaveBeenCalled();
	});

	it('calls swup.navigate in submitForm', async () => {
		swup.use(plugin);

		const navigateSpy = vitest.spyOn(swup, 'navigate').mockImplementation(() => {});

		const form = createForm('<form action="/path" data-swup-form><input type="hidden" name="a" value="b"></form>');
		const originalEvent = new SubmitEvent('submit', { cancelable: true });
		const event: DelegateEvent<SubmitEvent, HTMLFormElement> = { ...originalEvent, delegateTarget: form, preventDefault: vitest.fn() };
		plugin.submitForm(event);

		expect(navigateSpy).toHaveBeenCalledWith(
			'http://localhost:3000/path?a=b',
			expect.objectContaining({
				method: 'GET',
				cache: { read: false, write: true }
			}),
			expect.objectContaining({ el: form, event })
		);
	});

	it('calls swup.navigate in submitForm with post data', async () => {
		swup.use(plugin);

		const navigateSpy = vitest.spyOn(swup, 'navigate').mockImplementation(() => {});

		const form = createForm('<form action="/path" method="post" data-swup-form><input type="hidden" name="a" value="b"></form>');
		const originalEvent = new SubmitEvent('submit', { cancelable: true });
		const event: DelegateEvent<SubmitEvent, HTMLFormElement> = { ...originalEvent, delegateTarget: form, preventDefault: vitest.fn() };
		plugin.submitForm(event);

		expect(navigateSpy).toHaveBeenCalledWith(
			'http://localhost:3000/path',
			expect.objectContaining({
				method: 'POST',
				body: expect.any(URLSearchParams),
				cache: { read: false, write: true }
			}),
			expect.objectContaining({ el: form, event })
		);
	});

	it('sets up inline forms in visit:start hook', async () => {
		const spy = vitest.spyOn(plugin, 'prepareInlineForms').mockImplementation(() => {});
		swup.use(plugin);

		await swup.hooks.call('visit:start', visit, undefined);

		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith(visit, undefined, undefined);
	});

	it('sets up inline forms by manipulating the visit object', async () => {
		swup.use(plugin);

		const form = createForm('<form id="form" data-swup-inline-form></form>');
		visit.trigger.el = form;

		plugin.prepareInlineForms(visit, undefined);

		expect(visit.containers).toEqual(['#form']);
		expect(visit.animation.scope).toBe('containers');
		expect(visit.animation.selector).toBe('#form');
		expect(visit.scroll.target).toBe('#form');
	});

	it('does not set up forms not marked as inline', async () => {
		swup.use(plugin);

		const form = createForm('<form data-swup-form></form>');
		visit.trigger.el = form;

		plugin.prepareInlineForms(visit, undefined);

		expect(visit.containers).toEqual(['#swup']);
		expect(visit.animation.scope).not.toBe('containers');
		expect(visit.animation.selector).not.toBe('#form');
		expect(visit.scroll.target).not.toBe('#form');
	});
});
