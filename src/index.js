import Plugin from '@swup/plugin';
import delegate from 'delegate-it';
import { Link }  from 'swup/lib/helpers';

export default class FormPlugin extends Plugin {
    name = "FormsPlugin";

    constructor(options) {
        super();

        const defaultOptions = {
            formSelector: 'form[data-swup-form]'
        };

        this.options = {
            ...defaultOptions,
            ...options
        };
    }

    mount() {
        const swup = this.swup;

        // add empty handlers array for submitForm event
        swup._handlers.submitForm = [];
        swup._handlers.openFormSubmitInNewTab = [];

        // register handler
        swup.delegatedListeners.formSubmit = delegate(
            document,
            this.options.formSelector,
            'submit',
            this.onFormSubmit.bind(this)
        );
    }

    unmount() {
        const swup = this.swup;

        swup.delegatedListeners.formSubmit.destroy();
    }

    onFormSubmit(event) {
        const swup = this.swup;

        // no control key pressed
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
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
        } else {
            swup.triggerEvent('openFormSubmitInNewTab', event);
        }
    }

    appendQueryParams(url, formData) {
        url = url.split('?')[0]
        const query = new URLSearchParams(formData).toString()
        return query ? `${url}?${query}` : url;
    }
}
