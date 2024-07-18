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
export function getFormAttr(attr: 'method', form: HTMLFormElement, submitter: HTMLElement | null): FormMethod;
export function getFormAttr(attr: 'action', form: HTMLFormElement, submitter: HTMLElement | null): string;
export function getFormAttr(attr: 'enctype', form: HTMLFormElement, submitter: HTMLElement | null): string;
export function getFormAttr(attr: string, form: HTMLFormElement, submitter: HTMLElement | null, defaultValue: string): string;
export function getFormAttr(attr: string, form: HTMLFormElement, submitter: HTMLElement | null, defaultValue?: string): string | null;
export function getFormAttr(
	attr: string,
	form: HTMLFormElement,
	submitter: HTMLElement | null = null,
	defaultValue?: string
): string | null {
	const value = submitter?.getAttribute(`form${attr}`) ?? form.getAttribute(attr) ?? defaultValue;
	return sanitizeFormAttr(attr, value);
}

/**
* Sanitize a form attribute to allow easier comparison
*/
function sanitizeFormAttr(attr: string, value: string | undefined, defaultValue?: string): null | string | FormMethod {
	switch (attr) {
		case 'action':
			return value ?? getCurrentUrl();
		case 'method':
			return (value ?? 'get').toUpperCase() as FormMethod;
		case 'enctype':
			return (value ?? 'application/x-www-form-urlencoded').toLowerCase();
		default:
			return value ?? null;
	}
}

/**
* Strip empty params from the FormData (by reference)
* @see https://stackoverflow.com/a/64029534/586823
*/
export function stripEmptyFormParams(data: FormData): void {
	for (const [name, value] of Array.from(data.entries())) {
		if (value === '') data.delete(name);
	}
}

/**
 * Appends query parameters to a URL
 */
export function appendQueryParams(url: string, data: FormData): string {
	const path = url.split('?')[0];
	const query = new URLSearchParams(data as unknown as Record<string, string>).toString();
	return query ? `${path}?${query}` : path;
}
