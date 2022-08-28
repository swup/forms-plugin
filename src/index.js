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
        if (!event.metaKey) {
            const form = event.target;
            const formData = new FormData(form);
            const actionAttribute = form.getAttribute('action') || window.location.href;
            const methodAttribute = form.getAttribute('method') || 'GET';
            const link = new Link(actionAttribute);
            const url = link.getAddress();

            swup.triggerEvent('submitForm', event);

            event.preventDefault();

            if (link.getHash() != '') {
                swup.scrollToElement = link.getHash();
            }

            // get custom transition from data
            const customTransition = form.getAttribute('data-swup-transition');

            if (methodAttribute.toLowerCase() != 'get') {
                // remove page from cache
                swup.cache.remove(url);

                // send data
                swup.loadPage({
                    url,
                    method: methodAttribute,
                    data: formData,
                    customTransition,
                });
            } else {
                const urlWithQuery = this.appendFormDataAsQueryParameters(url, formData)

                // remove page from cache
                swup.cache.remove(urlWithQuery);

                // send data
                swup.loadPage({
                    url: urlWithQuery,
                    customTransition,
                });
            }
        } else {
            swup.triggerEvent('openFormSubmitInNewTab', event);
        }
    }

    appendFormDataAsQueryParameters(url, formData) {
        const query = new URLSearchParams(formData).toString()
        if (query && url.indexOf('?') == -1) {
            return url + '?' + query;
        } else if (query) {
            return url + '&' + query;
        } else {
            return url
        }
    }
}
