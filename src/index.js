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
			Control: false,
			Shift: false
		};
	}

	mount() {
		const swup = this.swup;

		// add empty handlers array for submitForm event
		swup._handlers.submitForm = [];
		swup._handlers.submitFormPrevented = [];

		// Register the submit handler. Using `capture:true` to be 
		// able to set the form's target attribute on the fly.
		swup.delegatedListeners.formSubmit = delegate(
			document,
			this.options.formSelector,
			'submit',
			this.onFormSubmit.bind(this),
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

	onFormSubmit(event) {
		const swup = this.swup;
		
		// Always trigger the submitForm event,
		// allowing it to be `defaultPrevented`
		swup.triggerEvent('submitForm', event);

		// Open the form in a new window if Shift is pressed
		if( this.specialKeys.Shift ) {
			this.swup.log("[swup] Form submitted to a new window");
			event.target.target = '_blank';
			return;
		}

		// Open the form in a new tab if either command or control is pressed
		if (this.specialKeys.Meta || this.specialKeys.Control) {
			this.swup.log("[swup] Form submitted to a new tab");
			event.target.target = '_blank';
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
		
		if( event.defaultPrevented ) {
			swup.triggerEvent('submitFormPrevented', event);
			return;
		}
		
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
