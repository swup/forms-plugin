import Plugin from '@swup/plugin';
import delegate from 'delegate';
import { queryAll } from 'swup/lib/utils';
import { Link } from 'swup/lib/helpers';

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
        swup.delegatedListeners.formSubmit.destroy();
    }

    onFormSubmit(event) {
        const swup = this.swup;

        // no control key pressed
        if (!event.metaKey) {
            const form = event.target;
            const formData = new FormData(form);
            const link = new Link(form.action);

            // fomr
            swup.triggerEvent('submitForm', event);

            event.preventDefault();

            if (link.getHash() != '') {
                swup.scrollToElement = link.getHash();
            }

            if (form.method.toLowerCase() != 'get') {
                // remove page from cache
                swup.cache.remove(link.getAddress());

                // send data
                swup.loadPage({
                    url: link.getAddress(),
                    method: form.method,
                    data: formData
                });
            } else {
                // create base url
                let url = link.getAddress() || window.location.href;
                let inputs = queryAll('input, select', form);
                if (url.indexOf('?') == -1) {
                    url += '?';
                } else {
                    url += '&';
                }

                // add form data to url
                inputs.forEach((input) => {
                    if (input.type == 'checkbox' || input.type == 'radio') {
                        if (input.checked) {
                            url +=
                                encodeURIComponent(input.name) +
                                '=' +
                                encodeURIComponent(input.value) +
                                '&';
                        }
                    } else {
                        url +=
                            encodeURIComponent(input.name) +
                            '=' +
                            encodeURIComponent(input.value) +
                            '&';
                    }
                });

                // remove last "&"
                url = url.slice(0, -1);

                // remove page from cache
                swup.cache.remove(url);

                // send data
                swup.loadPage({
                    url: url
                });
            }
        } else {
            swup.triggerEvent('openFormSubmitInNewTab', event);
        }
    }
}
