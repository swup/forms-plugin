/**
 * Track currently pressed keys
 */

export function trackKeys(keys: string[]) {
	let pressed: { [key: string]: boolean } = {};

	function watch() {
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);
		window.addEventListener('blur', handleWindowBlur);
	}

	function unwatch() {
		document.removeEventListener('keydown', handleKeyDown);
		document.removeEventListener('keyup', handleKeyUp);
		document.removeEventListener('blur', handleWindowBlur);
		reset();
	}

	function reset() {
		pressed = {};
	}

	function handleKeyDown({ key }: KeyboardEvent) {
		if (keys.includes(key)) {
			pressed[key] = true;
		}
	}

	function handleKeyUp({ key }: KeyboardEvent) {
		if (keys.includes(key)) {
			pressed[key] = false;
		}
	}

	function handleWindowBlur() {
		reset();
	}

	return {
		watch,
		unwatch,
		get pressed(): boolean {
			return Object.values(pressed).filter(Boolean).length > 0;
		}
	};
}
