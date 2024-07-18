import Plugin from '@swup/plugin';
import { Location } from 'swup';
import type { DelegateEvent, DelegateEventUnsubscribe, Handler } from 'swup';
import { appendQueryParams, FormMethod, getFormAttr, getFormInfo, stripEmptyFormParams } from './forms.js';

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
	specialKeys: { [key: string]: boolean } = {
		Meta: false,
		Control: false,
		Shift: false
	};

	formSubmitDelegate?: DelegateEventUnsubscribe;

	constructor(options: Partial<Options> = {}) {
		super();
		this.options = { ...this.defaults, ...options };
	}

	mount() {
		this.swup.hooks.create('form:submit');
		this.swup.hooks.create('form:submit:newtab');

		// Register the submit handler. Using `capture:true` to be
		// able to set the form's target attribute on the fly.
		this.formSubmitDelegate = this.swup.delegateEvent(
			this.options.formSelector,
			'submit',
			this.beforeFormSubmit.bind(this),
			{
				capture: true
			}
		);

		this.on('visit:start', this.handleInlineForms, { priority: 1 });

		document.addEventListener('keydown', this.onKeyDown);
		document.addEventListener('keyup', this.onKeyUp);
		window.addEventListener('blur', this.onBlur);
	}

	unmount() {
		this.formSubmitDelegate?.destroy();

		document.removeEventListener('keydown', this.onKeyDown);
		document.removeEventListener('keyup', this.onKeyUp);
		window.removeEventListener('blur', this.onBlur);
	}

	/**
	 * Handles form 'submit' events during the capture phase
	 */
	beforeFormSubmit(event: DelegatedSubmitEvent): void {
		const swup = this.swup;
		const { delegateTarget: form, submitter } = event;
		const action = getFormAttr('action', form, submitter);
		const opensInNewTabFromKeyPress = this.isSpecialKeyPressed();
		const opensInNewTabFromTargetAttr = getFormAttr('target', form, submitter) === '_blank';
		const opensInNewTab = opensInNewTabFromKeyPress || opensInNewTabFromTargetAttr;

		// Create temporary visit object for form:submit:* hooks
		const { url: to, hash } = Location.fromUrl(action);
		// @ts-expect-error: createVisit is currently private, need to make this semi-public somehow
		const visit = swup.createVisit({ to, hash, el: form, event });

		/**
		 * Allow ignoring this form submission via callback
		 * No use in checking if it will open in a new tab anyway
		 */
		if (!opensInNewTab && swup.shouldIgnoreVisit(action, { el: form, event })) {
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

			form.dataset.swupOriginalFormTarget = form.getAttribute('target') || '';
			form.setAttribute('target', '_blank');
			form.addEventListener(
				'submit',
				() => requestAnimationFrame(() => this.restorePreviousFormTarget(form)),
				{ once: true }
			);

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
	 * Restores the previous form target if available
	 */
	restorePreviousFormTarget(form: HTMLFormElement): void {
		if (form.dataset.swupOriginalFormTarget) {
			form.setAttribute('target', form.dataset.swupOriginalFormTarget);
		} else {
			form.removeAttribute('target');
		}
	}

	/**
	 * Submits a form through swup
	 */
	submitForm(event: DelegatedSubmitEvent): void {
		const el = event.delegateTarget;
		const { url, hash, method, data, body } = getFormInfo(el, event);
		let action = url;
		let params: { method: FormMethod; body?: FormData | URLSearchParams } = { method };

		switch (method) {
			case 'POST':
				params = { method, body };
				break;
			case 'GET':
				const query = this.options.stripEmptyParams ? stripEmptyFormParams(data) : data;
				action = appendQueryParams(action, query);
				break;
			default:
				console.warn(`Unsupported form method: ${method}`);
				return;
		}

		event.preventDefault();


		const cache = { read: false, write: true };

		this.swup.navigate(action + hash, { ...params, cache }, { el, event });
	}

	/**
	 * Is either command or control key down at the moment
	 */
	isSpecialKeyPressed(): boolean {
		return Object.values(this.specialKeys).some((value) => value);
	}

	/**
	 * Reset all entries in `specialKeys` to false
	 */
	resetSpecialKeys() {
		for (const key of Object.keys(this.specialKeys)) {
			this.specialKeys[key] = false;
		}
	}

	/**
	 * Run every time the window looses focus
	 */
	onBlur = () => {
		this.resetSpecialKeys();
	};

	/**
	 * Adjust `specialKeys` on keyDown
	 */
	onKeyDown = (event: KeyboardEvent): void => {
		if (this.specialKeys.hasOwnProperty(event.key)) {
			this.specialKeys[event.key] = true;
		}
	};

	/**
	 * Adjust `specialKeys` on keyUp
	 */
	onKeyUp = (event: KeyboardEvent): void => {
		if (this.specialKeys.hasOwnProperty(event.key)) {
			this.specialKeys[event.key] = false;
		}
	};

	/**
	 * Handles visits triggered by forms matching [data-swup-inline-form]
	 */
	handleInlineForms: Handler<'visit:start'> = (visit) => {
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
