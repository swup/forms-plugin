import Plugin from '@swup/plugin';
import { Location, getCurrentUrl } from 'swup';

export default class SwupFormsPlugin extends Plugin {
	name = 'SwupFormsPlugin';

	requires = { swup: '>=4' };

	defaults = {
		formSelector: 'form[data-swup-form]'
	};

	// Track pressed keys to detect form submissions to a new tab
	specialKeys = {
		Meta: false,
		Control: false,
		Shift: false
	};

	constructor(options = {}) {
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

		document.addEventListener('keydown', this.onKeyDown);
		document.addEventListener('keyup', this.onKeyUp);
	}

	unmount() {
		this.formSubmitDelegate.destroy();

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
		const el = event.target;
		const { url, hash, method, data, body } = this.getFormInfo(el);
		let action = url;
		let params = { method };

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

	getFormInfo(form) {
		const action = form.getAttribute('action') || getCurrentUrl();
		const { url, hash } = Location.fromUrl(action);
		const method = (form.getAttribute('method') || 'get').toUpperCase();
		const encoding = (
			form.getAttribute('enctype') || 'application/x-www-form-urlencoded'
		).toLowerCase();
		const multipart = encoding === 'multipart/form-data';
		const data = new FormData(form);
		let body = data;
		if (!multipart) {
			body = new URLSearchParams(data);
		}
		return { url, hash, method, data, body, encoding };
	}

	/**
	 * Appends query parameters to a URL
	 * @param {string} url
	 * @param {FormData} formData
	 * @returns {string}
	 */
	appendQueryParams(url, formData) {
		const path = url.split('?')[0];
		const query = new URLSearchParams(formData).toString();
		return query ? `${path}?${query}` : path;
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
