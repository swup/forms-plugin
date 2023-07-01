import Plugin from '@swup/plugin';
import { Location, getCurrentUrl } from 'swup';

export default class SwupFormsPlugin extends Plugin {
	name = 'SwupFormsPlugin';

	requires = { swup: '>=3.0.0' };

	constructor(options) {
		super();

		const defaultOptions = {
			formSelector: 'form[data-swup-form]'
		};

		this.options = {
			...defaultOptions,
			...options
		};

		/**
		 * Helps detecting form submits to a new tab
		 */
		this.specialKeys = {
			Meta: false,
			Control: false,
			Shift: false
		};
	}

	mount() {
		const swup = this.swup;

		// add empty handlers array for submitForm event
		swup._handlers.submitForm = [];
		swup._handlers.openFormSubmitInNewTab = [];

		// Register the submit handler. Using `capture:true` to be
		// able to set the form's target attribute on the fly.
		swup.delegatedListeners.formSubmit = swup.delegateEvent(
			this.options.formSelector,
			'submit',
			this.beforeFormSubmit.bind(this),
			{
				capture: true
			}
		);

		document.addEventListener('keydown', this.onKeyDown);
		document.addEventListener('keyup', this.onKeyUp);
	}

	unmount() {
		const swup = this.swup;

		swup.delegatedListeners.formSubmit.destroy();

		document.removeEventListener('keydown', this.onKeyDown);
		document.removeEventListener('keyup', this.onKeyUp);
	}

	/**
	 * Handles form 'submit' events during the capture phase
	 * @param {SubmitEvent} event
	 * @returns {void}
	 */
	beforeFormSubmit(event) {
		const swup = this.swup;
		const form = event.target;
		const action = form.getAttribute('action') || getCurrentUrl();
		const opensInNewTabFromKeyPress = this.isSpecialKeyPressed();
		const opensInNewTabFromTargetAttr = form.getAttribute('target') === '_blank';
		const opensInNewTab = opensInNewTabFromKeyPress || opensInNewTabFromTargetAttr;

		/**
		 * Allow ignoring this form submission via callback
		 * No use in checking if it will open in a new tab anyway
		 */
		if (!opensInNewTab && this.swup.shouldIgnoreVisit(action, { el: form, event })) {
			return;
		}

		/**
		 * Always trigger the submitForm event,
		 * allowing it to be `defaultPrevented`
		 */
		swup.triggerEvent('submitForm', event);

		/**
		 * Open the form in a new tab because of its target attribute
		 */
		if (opensInNewTabFromTargetAttr) {
			swup.triggerEvent('openFormSubmitInNewTab', event);
			return;
		}

		/**
		 * Open the form in a new tab if either Command (Mac), Control (Windows) or Shift is pressed.
		 * Normalizes behavior across browsers.
		 */
		if (opensInNewTabFromKeyPress) {
			this.resetSpecialKeys();

			swup.triggerEvent('openFormSubmitInNewTab', event);

			form.dataset.swupOriginalFormTarget = form.getAttribute('target') || '';
			form.setAttribute('target', '_blank');
			form.addEventListener(
				'submit',
				() => requestAnimationFrame(() => this.restorePreviousFormTarget(form)),
				{ once: true }
			);

			return;
		}

		this.submitForm(event);
	}

	/**
	 * Restores the previous form target if available
	 * @param {HTMLFormElement} form
	 * @returns {void}
	 */
	restorePreviousFormTarget(form) {
		if (form.dataset.swupOriginalFormTarget) {
			form.setAttribute('target', form.dataset.swupOriginalFormTarget);
		} else {
			form.removeAttribute('target');
		}
	}

	/**
	 * Submits a form through swup
	 * @param {SubmitEvent} event
	 * @returns {void}
	 */
	submitForm(event) {
		const swup = this.swup;

		event.preventDefault();

		const form = event.target;
		const data = new FormData(form);
		const action = form.getAttribute('action') || getCurrentUrl();
		const method = (form.getAttribute('method') || 'get').toUpperCase();
		const customTransition = form.getAttribute('data-swup-transition');

		let { url, hash } = Location.fromUrl(action);

		if (hash) {
			swup.scrollToElement = hash;
		}

		if (method === 'GET') {
			url = this.appendQueryParams(url, data);
			swup.cache.remove(url);
			swup.loadPage({ url, customTransition });
		} else {
			swup.cache.remove(url);
			swup.loadPage({ url, method, data, customTransition });
		}
	}

	/**
	 * Appends query parameters to a URL
	 * @param {string} url
	 * @param {FormData} formData
	 * @returns {string}
	 */
	appendQueryParams(url, formData) {
		url = url.split('?')[0];
		const query = new URLSearchParams(formData).toString();
		return query ? `${url}?${query}` : url;
	}

	/**
	 * Is either command or control key down at the moment
	 * @returns {boolean}
	 */
	isSpecialKeyPressed() {
		return Object.values(this.specialKeys).some((value) => value);
	}

	/**
	 * Reset all entries in `specialKeys` to false
	 */
	resetSpecialKeys() {
		for (const [key, value] of Object.entries(this.specialKeys)) {
			this.specialKeys[key] = false;
		}
	}

	/**
	 * Adjust `specialKeys` on keyDown
	 * @param {KeyboardEvent} e
	 * @returns {void}
	 */
	onKeyDown = (e) => {
		if (!this.specialKeys.hasOwnProperty(e.key)) return;
		this.specialKeys[e.key] = true;
	};

	/**
	 * Adjust `specialKeys` on keyUp
	 * @param {KeyboardEvent} e
	 * @returns {void}
	 */
	onKeyUp = (e) => {
		if (!this.specialKeys.hasOwnProperty(e.key)) return;
		this.specialKeys[e.key] = false;
	};
}
