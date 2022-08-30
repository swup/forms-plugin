import Plugin from '@swup/plugin';
import delegate from 'delegate-it';
import { Link } from 'swup/lib/helpers';

export default class FormPlugin extends Plugin {
	name = 'FormsPlugin';

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
			Control: false
		};
	}

	mount() {
		const swup = this.swup;

		// add empty handlers array for submitForm event
		swup._handlers.submitForm = [];

		// register handler
		swup.delegatedListeners.formSubmit = delegate(
			document,
			this.options.formSelector,
			'submit',
			this.onFormSubmit.bind(this)
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

	onFormSubmit(event) {
		const swup = this.swup;

		// Bail early if a special key is pressed
		if (this.isSpecialKeyPressed()) {
			return;
		}

		const form = event.target;
		const data = new FormData(form);
		const action = form.getAttribute('action') || window.location.href;
		const method = (form.getAttribute('method') || 'get').toUpperCase();
		const customTransition = form.getAttribute('data-swup-transition');

		const link = new Link(action);
		const hash = link.getHash();
		let url = link.getAddress();

		swup.triggerEvent('submitForm', event);

		event.preventDefault();

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
