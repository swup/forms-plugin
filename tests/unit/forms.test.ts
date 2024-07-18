import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';
import { appendQueryParams, forceFormToOpenInNewTab, getFormAttr, getFormInfo, stripEmptyFormParams } from '../../src/forms.js';

const createForm = (html: string) => {
	return new window.DOMParser().parseFromString(html, 'text/html').querySelector('form')!;
};

const createButton = (html: string) => {
	return new window.DOMParser().parseFromString(html, 'text/html').querySelector('button')!;
};

describe('appendQueryParams', () => {
	const empty = new FormData();
	const data = new FormData();
	data.append('a', 'b');
	data.append('c', 'd');

	it('does not add empty params', () => {
		expect(appendQueryParams('/', empty)).toBe('/');
		expect(appendQueryParams('/path', empty)).toBe('/path');
		expect(appendQueryParams('/path?query', empty)).toBe('/path');
	});

	it('does not add empty params to an absolute url', () => {
		expect(appendQueryParams('https://example.net', empty)).toBe('https://example.net');
		expect(appendQueryParams('https://example.net/path', empty)).toBe('https://example.net/path');
		expect(appendQueryParams('https://example.net/path?query', empty)).toBe('https://example.net/path');
	});

	it('adds query params to a url', () => {
		expect(appendQueryParams('/', data)).toBe('/?a=b&c=d');
		expect(appendQueryParams('/path', data)).toBe('/path?a=b&c=d');
	});

	it('adds query params to an absolute url', () => {
		expect(appendQueryParams('https://example.net', data)).toBe('https://example.net?a=b&c=d');
		expect(appendQueryParams('https://example.net/path', data)).toBe('https://example.net/path?a=b&c=d');
		expect(appendQueryParams('https://example.net?a=1&b=2&c=3', data)).toBe('https://example.net?a=b&c=d');
	});

	it('keeps hash in place', () => {
		expect(appendQueryParams('/#hash', data)).toBe('/?a=b&c=d#hash');
		expect(appendQueryParams('/path#hash', data)).toBe('/path?a=b&c=d#hash');
		expect(appendQueryParams('https://example.net/path#hash', data)).toBe('https://example.net/path?a=b&c=d#hash');
	});
});

describe('stripEmptyFormParams', () => {
	it('removes empty form params', () => {
		const data = (params: Record<string, string>) => {
			const data = new FormData();
			for (const [key, value] of Object.entries(params)) {
				data.append(key, value);
			}
			return data;
		};

		expect(stripEmptyFormParams(data({ a: 'b', c: '' }))).toStrictEqual(data({ a: 'b' }));
		expect(stripEmptyFormParams(data({ a: 'b', c: '0' }))).toStrictEqual(data({ a: 'b', c: '0' }));
		expect(stripEmptyFormParams(data({ a: 'b', c: ' ' }))).toStrictEqual(data({ a: 'b', c: ' ' }));
		expect(stripEmptyFormParams(data({ a: 'b', c: '', d: 'e' }))).toStrictEqual(data({ a: 'b', d: 'e' }));
	});
});

describe('forceFormToOpenInNewTab', () => {
	beforeEach(() => {
		vitest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 0));
	});

	afterEach(() => {
		vitest.resetAllMocks();
	});

	it('sets target attribute on the form', () => {
		const form = createForm('<form></form>');
		forceFormToOpenInNewTab(form);
		expect(form.getAttribute('target')).toBe('_blank');
	});

	it('overwrites target attribute on the form', () => {
		const form = createForm('<form target="test"></form>');
		forceFormToOpenInNewTab(form);
		expect(form.getAttribute('target')).toBe('_blank');
	});

	it('restores previous target attribute on the form', () => {
		const form = createForm('<form target="test"></form>');
		const restore = forceFormToOpenInNewTab(form);
		restore();
		expect(form.getAttribute('target')).toBe('test');
	});
});

describe('getFormAttr', () => {
	describe('action', () => {
		it('reads relative action', () => {
			const form = createForm('<form action="/path"></form>');
			expect(getFormAttr('action', form)).toBe('/path');
		});

		it('reads absolute action', () => {
			const form = createForm('<form action="https://example.net/path"></form>');
			expect(getFormAttr('action', form)).toBe('https://example.net/path');
		});

		it('reads empty action', () => {
			const form = createForm('<form action=""></form>');
			expect(getFormAttr('action', form)).toBe('');
		});

		it('falls back on missing action', () => {
			const form = createForm('<form></form>');
			expect(getFormAttr('action', form)).toBe('/');
		});

		it('prefers submitter over form', () => {
			const form = createForm('<form action="/path"></form>');
			const button = createButton('<button formaction="/other"></button>');
			expect(getFormAttr('action', form)).toBe('/path');
			expect(getFormAttr('action', form, button)).toBe('/other');
		});
	});

	describe('method', () => {
		it('reads method', () => {
			const form = createForm('<form method="post"></form>');
			expect(getFormAttr('method', form)).toBe('POST');
		});

		it('falls back on empty method', () => {
			const form = createForm('<form method=""></form>');
			expect(getFormAttr('method', form)).toBe('GET');
		});

		it('falls back on missing action', () => {
			const form = createForm('<form></form>');
			expect(getFormAttr('method', form)).toBe('GET');
		});

		it('prefers submitter over form', () => {
			const form = createForm('<form method="post"></form>');
			const button = createButton('<button formmethod="delete"></button>');
			expect(getFormAttr('method', form)).toBe('POST');
			expect(getFormAttr('method', form, button)).toBe('DELETE');
		});
	});

	describe('enctype', () => {
		it('reads enctype', () => {
			const form = createForm('<form enctype="multipart/form-data"></form>');
			expect(getFormAttr('enctype', form)).toBe('multipart/form-data');
		});

		it('falls back on empty enctype', () => {
			const form = createForm('<form enctype=""></form>');
			expect(getFormAttr('enctype', form)).toBe('application/x-www-form-urlencoded');
		});

		it('falls back on missing enctype', () => {
			const form = createForm('<form></form>');
			expect(getFormAttr('enctype', form)).toBe('application/x-www-form-urlencoded');
		});

		it('prefers submitter over form', () => {
			const form = createForm('<form enctype="multipart/form-data"></form>');
			const button = createButton('<button formenctype="application/x-www-form-urlencoded"></button>');
			expect(getFormAttr('enctype', form)).toBe('multipart/form-data');
			expect(getFormAttr('enctype', form, button)).toBe('application/x-www-form-urlencoded');
		});
	});
});

describe('getFormInfo', () => {
	it('reads info from attributes', () => {
		const form = createForm('<form action="/path#anchor"></form>');
		expect(getFormInfo(form)).toMatchObject({
			url: '/path',
			hash: '#anchor',
			method: 'GET',
			encoding: 'application/x-www-form-urlencoded',
		});
	});

	it('builds get params', () => {
		const form = createForm('<form action="/path#anchor"><input type="hidden" name="a" value="b"></form>');
		expect(getFormInfo(form)).toMatchObject({
			action: '/path',
			url: '/path?a=b',
			hash: '#anchor',
			method: 'GET',
			body: undefined,
			encoding: 'application/x-www-form-urlencoded',
		});
	});

	it('builds post params', () => {
		const form = createForm('<form action="/path#anchor" method="post"><input type="hidden" name="b" value="c"></form>');
		expect(getFormInfo(form)).toMatchObject({
			action: '/path',
			url: '/path',
			hash: '#anchor',
			method: 'POST',
			body: new URLSearchParams({ b: 'c' }),
			encoding: 'application/x-www-form-urlencoded',
		});
	});

	it('builds multipart params', () => {
		const form = createForm('<form action="/path#anchor" method="post" enctype="multipart/form-data"><input type="hidden" name="b" value="c"></form>');
		expect(getFormInfo(form)).toMatchObject({
			action: '/path',
			url: '/path',
			hash: '#anchor',
			method: 'POST',
			body: new FormData(form),
			encoding: 'multipart/form-data',
		});
	});
});
