import Plugin from '@swup/plugin';
import type { DelegateEvent, DelegateEventUnsubscribe, Handler } from 'swup';
import { forceFormToOpenInNewTab, getFormInfo } from './forms.js';
import { trackKeys } from './keys.js';

declare module 'swup' {
	export interface HookDefinitions {
		'form:submit': { el: HTMLFormElement; event: DelegatedSubmitEvent };
		'form:submit:newtab': { el: HTMLFormElement; event: DelegatedSubmitEvent };
	}
}

type DelegatedSubmitEvent = DelegateEvent<SubmitEvent, HTMLFormElement>;

type Options = {
	formSelector: string;
	inlineFormSelector: string;
	stripEmptyParams: boolean;
};

export default class SwupFormsPlugin extends Plugin {
	name = 'SwupFormsPlugin';

	requires = { swup: '>=4' };

	defaults: Options = {
		formSelector: 'form[data-swup-form]',
		inlineFormSelector: 'form[data-swup-inline-form]',
		stripEmptyParams: false
	};

	options: Options;

	// Track pressed keys to detect form submissions to a new tab
	specialKeys: ReturnType<typeof trackKeys>;

	formSubmitDelegate?: DelegateEventUnsubscribe;

	constructor(options: Partial<Options> = {}) {
		super();
		this.options = { ...this.defaults, ...options };
		this.specialKeys = trackKeys(['Meta', 'Control', 'Shift']);
		this.beforeFormSubmit = this.beforeFormSubmit.bind(this);
	}

	mount() {
		this.swup.hooks.create('form:submit');
		this.swup.hooks.create('form:submit:newtab');

		this.specialKeys.watch();

		// Register the submit handler. Using `capture:true` to be
		// able to set the form's target attribute on the fly.
		this.formSubmitDelegate = this.swup.delegateEvent(
			this.options.formSelector,
			'submit',
			this.beforeFormSubmit,
			{
				capture: true
			}
		);

		this.on('visit:start', this.prepareInlineForms, { priority: 1 });
	}

	unmount() {
		this.formSubmitDelegate?.destroy();
		this.specialKeys.unwatch();
	}

	/**
	 * Handles form 'submit' events during the capture phase
	 */
	beforeFormSubmit(event: DelegatedSubmitEvent): void {
		const swup = this.swup;
		const { delegateTarget: form, submitter } = event;

		const { href, url, hash, target } = getFormInfo(form, submitter);
		const opensInNewTabFromKeyPress = this.specialKeys.pressed;
		const opensInNewTabFromTargetAttr = target === '_blank';
		const opensInNewTab = opensInNewTabFromKeyPress || opensInNewTabFromTargetAttr;

		// Create temporary visit object for form:submit:* hooks
		// @ts-expect-error: createVisit is currently private, need to make this semi-public somehow
		const visit = swup.createVisit({ to: url, hash, el: form, event });

		/**
		 * Allow ignoring this form submission via callback
		 * No use in checking if it will open in a new tab anyway
		 */
		if (!opensInNewTab && swup.shouldIgnoreVisit(href, { el: form, event })) {
			return;
		}

		/**
		 * Open the form in a new tab because of its target attribute
		 */
		if (opensInNewTabFromTargetAttr) {
			swup.hooks.callSync('form:submit:newtab', visit, { el: form, event });
			return;
		}

		/**
		 * Open the form in a new tab if either Command (Mac), Control (Windows) or Shift is pressed.
		 * Normalizes behavior across browsers.
		 */
		if (opensInNewTabFromKeyPress) {
			swup.hooks.callSync('form:submit:newtab', visit, { el: form, event });
			const restorePreviousTarget = forceFormToOpenInNewTab(form);
			form.addEventListener('submit', () => setTimeout(restorePreviousTarget), { once: true });
			return;
		}

		/**
		 * Trigger the form:submit hook.
		 */
		swup.hooks.callSync('form:submit', visit, { el: form, event }, () => {
			this.submitForm(event);
		});
	}

	/**
	 * Submits a form through swup
	 */
	submitForm(event: DelegatedSubmitEvent): void {
		const { delegateTarget: form, submitter } = event;
		const { stripEmptyParams } = this.options;
		const { href, method, body } = getFormInfo(form, submitter, { stripEmptyParams });
		const cache = { read: false, write: true };

		if (!['GET', 'POST'].includes(method)) {
			console.warn(`Unsupported form method: ${method}`);
			return;
		}

		event.preventDefault();

		this.swup.navigate(href, { method, body, cache }, { el: form, event });
	}

	/**
	 * Handles visits triggered by forms matching [data-swup-inline-form]
	 */
	prepareInlineForms: Handler<'visit:start'> = (visit) => {
		const { el } = visit.trigger;
		if (!el?.matches(this.options.inlineFormSelector)) return;

		if (!el.id) {
			console.error(`[@swup/forms-plugin] inline forms must have an id attribute:`, el);
			return;
		}

		// Modify visit to only replace and animate the form's container
		const selector = `#${el.id}`;
		visit.containers = [selector];
		visit.animation.scope = 'containers';
		visit.animation.selector = selector;
		visit.scroll.target = selector;

		// Modify visit to focus the form after the transition
		// @ts-expect-error: can't know if A11yPlugin is installed
		const a11y = visit.a11y as { focus?: boolean | string };
		if (typeof a11y === 'object') {
			a11y.focus = selector;
		}
	};
}
