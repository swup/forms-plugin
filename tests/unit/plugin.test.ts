import { vitest, describe, expect, it, beforeEach, afterEach } from 'vitest';
import Swup, { Visit } from 'swup';
import SwupFormsPlugin from '../../src/index.js';

// vitest.mock('../../src/forms.js');
// vitest.mock('../../src/keys.js');

const page = { page: { html: '', url: '/' } };

const createForm = (html: string) => {
	return new window.DOMParser().parseFromString(html, 'text/html').querySelector('form')!;
};

const submitForm = (form: HTMLFormElement, submitter?: HTMLButtonElement | null) => {
	document.body.appendChild(form);
	if (submitter) {
		submitter.click();
	} else {
		form.dispatchEvent(new Event('submit', { bubbles: true }));
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

		const form = createForm('<form action="/submit"></form>');
		submitForm(form);

		expect(spy).not.toHaveBeenCalled();
	});

	it('calls beforeFormSubmit for swup forms', async () => {
		const spy = vitest.spyOn(plugin, 'beforeFormSubmit').mockImplementation(() => {});
		swup.use(plugin);

		const form = createForm('<form action="/submit" data-swup-form></form>');
		submitForm(form);

		expect(spy).toHaveBeenCalledWith(expect.objectContaining({ delegateTarget: form }));
	});

	it('receives the submitter in beforeFormSubmit', async () => {
		const spy = vitest.spyOn(plugin, 'beforeFormSubmit').mockImplementation(() => {});
		swup.use(plugin);

		const form = createForm('<form action="/submit" data-swup-form><button type="submit"></button></form>');
		const submitter = form.querySelector('button');
		submitForm(form);
		expect(spy).toHaveBeenCalledWith(expect.not.objectContaining({ submitter }));
		submitForm(form, submitter);
		expect(spy).toHaveBeenCalledWith(expect.objectContaining({ submitter }));
	});

	it('sets up inline forms in visit:start hook', async () => {
		const spy = vitest.spyOn(plugin, 'prepareInlineForms').mockImplementation(() => {});
		swup.use(plugin);

		await swup.hooks.call('visit:start', visit, undefined);

		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith(visit, undefined, undefined);
	});
});
