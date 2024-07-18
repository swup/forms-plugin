import { getCurrentUrl, Location } from "swup";

export type FormMethod = 'GET' | 'POST';

export type FormInfo = {
	url: string;
	hash: string;
	method: FormMethod;
	data: FormData;
	body: URLSearchParams | FormData;
	encoding: string;
};

/**
 * Get information about where and how a form will submit
 */
export function getFormInfo(form: HTMLFormElement, { submitter }: SubmitEvent): FormInfo {
	const method = getFormAttr('method', form, submitter);
	const action = getFormAttr('action', form, submitter);
	const encoding = getFormAttr('enctype', form, submitter);
	const { url, hash } = Location.fromUrl(action);
	const multipart = encoding === 'multipart/form-data';

	const data = new FormData(form);
	let body: FormData | URLSearchParams;
	if (multipart) {
		body = data;
	} else {
		body = new URLSearchParams(data as unknown as Record<string, string>);
	}

	return { url, hash, method, data, body, encoding };
}

/**
* Get a form attribute either from the form, or the submitter element if present
*/
export function getFormAttr(attr: 'method', form: HTMLFormElement, submitter?: HTMLElement | null): FormMethod;
export function getFormAttr(attr: 'action', form: HTMLFormElement, submitter?: HTMLElement | null): string;
export function getFormAttr(attr: 'enctype', form: HTMLFormElement, submitter?: HTMLElement | null): string;
export function getFormAttr(attr: string, form: HTMLFormElement, submitter: HTMLElement | null, defaultValue: string): string;
export function getFormAttr(attr: string, form: HTMLFormElement, submitter?: HTMLElement | null, defaultValue?: string): string | null;
export function getFormAttr(
	attr: string,
	form: HTMLFormElement,
	submitter?: HTMLElement | null,
	defaultValue?: string
): string | null {
	const value = submitter?.getAttribute(`form${attr}`) ?? form.getAttribute(attr) ?? defaultValue;
	return sanitizeFormAttr(attr, value);
}

/**
* Sanitize a form attribute to allow easier comparison
*/
function sanitizeFormAttr(attr: string, value: string | undefined): null | string | FormMethod {
	switch (attr) {
		case 'action':
			return value ?? getCurrentUrl();
		case 'method':
			return (value || 'get').toUpperCase() as FormMethod;
		case 'enctype':
			return (value || 'application/x-www-form-urlencoded').toLowerCase();
		default:
			return value ?? null;
	}
}

/**
* Strip empty params from a FormData object, returning a new FormData object
* @see https://stackoverflow.com/a/64029534/586823
*/
export function stripEmptyFormParams(data: FormData): FormData {
	const stripped = new FormData();
	for (const [name, value] of Array.from(data.entries())) {
		if (value !== '') {
			stripped.append(name, value);
		}
	}
	return stripped;
}

/**
 * Appends query parameters to a URL
 */
export function appendQueryParams(url: string, params: FormData): string {
	const path = url.split('?')[0];
	const query = new URLSearchParams(params as unknown as Record<string, string>).toString();
	return query ? `${path}?${query}` : path;
}

/**
* Force a form to open in a new tab by setting the target attribute to _blank
* @returns A function to restore the original target attribute
*/
export function forceFormToOpenInNewTab(form: HTMLFormElement): () => void {
	const originalTarget = form.getAttribute('target') || '';
	form.setAttribute('target', '_blank');

	return () => {
		if (originalTarget) {
			form.setAttribute('target', originalTarget);
		} else {
			form.removeAttribute('target');
		}
	}
}
