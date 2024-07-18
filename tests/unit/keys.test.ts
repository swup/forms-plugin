import { afterEach, describe, expect, it } from 'vitest';
import { trackKeys } from '../../src/keys.js';

const keydown = (key: string) => document.dispatchEvent(new KeyboardEvent('keydown', { key }));
const keyup = (key: string) => document.dispatchEvent(new KeyboardEvent('keyup', { key }));

describe('trackKeys', () => {
	let keys: ReturnType<typeof trackKeys>;

	afterEach(() => {
		keys.unwatch();
	});

	it('reports keys as unwatched initially', () => {
		keys = trackKeys(['a', 'b']);

		expect(keys.pressed).toBe(false);
	});

	it('ignores key presses initially', () => {
		keys = trackKeys(['a', 'b']);

		keydown('a');
		expect(keys.pressed).toBe(false);
	});

	it('registers key presses when watching', () => {
		keys = trackKeys(['a', 'b']);
		keys.watch();

		keydown('a');
		expect(keys.pressed).toBe(true);
	});

	it('ignores key presses when unwatched', () => {
		keys = trackKeys(['a', 'b']);
		keys.watch();
		keys.unwatch();

		keydown('a');
		expect(keys.pressed).toBe(false);
	});

	it('unregisters key presses on keyup', () => {
		keys = trackKeys(['a', 'b']);
		keys.watch();

		keydown('a');
		expect(keys.pressed).toBe(true);
		keyup('a');
		expect(keys.pressed).toBe(false);
	});

	it('handles multiple keys', () => {
		keys = trackKeys(['a', 'b', 'c']);
		keys.watch();

		keydown('a');
		expect(keys.pressed).toBe(true);
		keydown('b');
		expect(keys.pressed).toBe(true);
		keyup('a');
		expect(keys.pressed).toBe(true);
		keyup('b');
		expect(keys.pressed).toBe(false);
	});

	it('handles special keys', () => {
		keys = trackKeys(['Control', 'Shift']);
		keys.watch();

		keydown('Control');
		expect(keys.pressed).toBe(true);
		keydown('Shift');
		expect(keys.pressed).toBe(true);
		keyup('Control');
		expect(keys.pressed).toBe(true);
		keyup('Shift');
		expect(keys.pressed).toBe(false);
	});

	it('resets on unwatch', () => {
		keys = trackKeys(['a', 'b']);
		keys.watch();

		keydown('a');
		expect(keys.pressed).toBe(true);
		keys.unwatch();
		expect(keys.pressed).toBe(false);
		keyup('a');
		expect(keys.pressed).toBe(false);
	});
});
