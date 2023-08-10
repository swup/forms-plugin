import Plugin from '@swup/plugin';
import { Location, getCurrentUrl } from 'swup';
import type { DelegateEvent, DelegateEventUnsubscribe, Handler } from 'swup';

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
};

type FormInfo = {
	url: string;
	hash: string;
	method: 'GET' | 'POST';
	data: FormData;
	body: URLSearchParams | FormData;
	encoding: string;
};

export default class SwupFormsPlugin extends Plugin {
	name = 'SwupFormsPlugin';

	requires = { swup: '>=4' };

	defaults: Options = {
		formSelector: 'form[data-swup-form]',
		inlineFormSelector: 'form[data-swup-inline-form]'
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
	}

	unmount() {
		this.formSubmitDelegate?.destroy();

		document.removeEventListener('keydown', this.onKeyDown);
		document.removeEventListener('keyup', this.onKeyUp);
	}

	/**
	 * Handles form 'submit' events during the capture phase
	 */
	beforeFormSubmit(event: DelegatedSubmitEvent): void {
		const swup = this.swup;
		const form = event.delegateTarget;
		const action = form.getAttribute('action') || getCurrentUrl();
		const opensInNewTabFromKeyPress = this.isSpecialKeyPressed();
		const opensInNewTabFromTargetAttr = form.getAttribute('target') === '_blank';
		const opensInNewTab = opensInNewTabFromKeyPress || opensInNewTabFromTargetAttr;

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
			swup.hooks.callSync('form:submit:newtab', { el: form, event });
			return;
		}

		/**
		 * Open the form in a new tab if either Command (Mac), Control (Windows) or Shift is pressed.
		 * Normalizes behavior across browsers.
		 */
		if (opensInNewTabFromKeyPress) {
			swup.hooks.callSync('form:submit:newtab', { el: form, event });

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
		swup.hooks.callSync('form:submit', { el: form, event }, () => {
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
		const { url, hash, method, data, body } = this.getFormInfo(el);
		let action = url;
		let params: { method: 'GET' | 'POST'; body?: FormData | URLSearchParams } = { method };

		switch (method) {
			case 'POST':
				params = { method, body };
				break;
			case 'GET':
				action = this.appendQueryParams(action, data);
				break;
			default:
				console.warn(`Unsupported form method: ${method}`);
				return;
		}

		event.preventDefault();
		this.swup.cache.delete(action);
		this.swup.navigate(action + hash, params, { el, event });
	}

	/**
	 * Get information about where and how a form will submit
	 */
	getFormInfo(form: HTMLFormElement): FormInfo {
		const action = form.getAttribute('action') || getCurrentUrl();
		const { url, hash } = Location.fromUrl(action);
		const method = (form.getAttribute('method') || 'get').toUpperCase() as 'GET' | 'POST';
		const encoding = (
			form.getAttribute('enctype') || 'application/x-www-form-urlencoded'
		).toLowerCase();
		const multipart = encoding === 'multipart/form-data';
		const data = new FormData(form);
		let body: FormData | URLSearchParams = data;
		if (!multipart) {
			body = new URLSearchParams(data as unknown as Record<string, string>);
		}
		return { url, hash, method, data, body, encoding };
	}

	/**
	 * Appends query parameters to a URL
	 */
	appendQueryParams(url: string, data: FormData): string {
		const path = url.split('?')[0];
		const query = new URLSearchParams(data as unknown as Record<string, string>).toString();
		return query ? `${path}?${query}` : path;
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

		const selector = `#${el.id}`;
		visit.containers = [selector];
		visit.animation.scope = 'containers';
		visit.animation.selector = selector;
		visit.scroll.target = selector;
	};
}
