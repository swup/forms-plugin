(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["SwupFormsPlugin"] = factory();
	else
		root["SwupFormsPlugin"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var query = exports.query = function query(selector) {
	var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

	if (typeof selector !== 'string') {
		return selector;
	}

	return context.querySelector(selector);
};

var queryAll = exports.queryAll = function queryAll(selector) {
	var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

	if (typeof selector !== 'string') {
		return selector;
	}

	return Array.prototype.slice.call(context.querySelectorAll(selector));
};

var escapeCssIdentifier = exports.escapeCssIdentifier = function escapeCssIdentifier(ident) {
	if (window.CSS && window.CSS.escape) {
		return CSS.escape(ident);
	} else {
		return ident;
	}
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Link = function () {
	function Link(elementOrUrl) {
		_classCallCheck(this, Link);

		if (elementOrUrl instanceof Element || elementOrUrl instanceof SVGElement) {
			this.link = elementOrUrl;
		} else {
			this.link = document.createElement('a');
			this.link.href = elementOrUrl;
		}
	}

	_createClass(Link, [{
		key: 'getPath',
		value: function getPath() {
			var path = this.link.pathname;
			if (path[0] !== '/') {
				path = '/' + path;
			}
			return path;
		}
	}, {
		key: 'getAddress',
		value: function getAddress() {
			var path = this.link.pathname + this.link.search;

			if (this.link.getAttribute('xlink:href')) {
				path = this.link.getAttribute('xlink:href');
			}

			if (path[0] !== '/') {
				path = '/' + path;
			}
			return path;
		}
	}, {
		key: 'getHash',
		value: function getHash() {
			return this.link.hash;
		}
	}]);

	return Link;
}();

exports.default = Link;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _index = __webpack_require__(3);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _index2.default; // this is here for webpack to expose SwupPlugin as window.SwupPlugin

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _plugin = __webpack_require__(4);

var _plugin2 = _interopRequireDefault(_plugin);

var _delegateIt = __webpack_require__(5);

var _delegateIt2 = _interopRequireDefault(_delegateIt);

var _helpers = __webpack_require__(6);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FormPlugin = function (_Plugin) {
	_inherits(FormPlugin, _Plugin);

	function FormPlugin(options) {
		_classCallCheck(this, FormPlugin);

		var _this = _possibleConstructorReturn(this, (FormPlugin.__proto__ || Object.getPrototypeOf(FormPlugin)).call(this));

		_this.name = 'FormsPlugin';

		_this.onKeyDown = function (e) {
			if (!_this.specialKeys.hasOwnProperty(e.key)) return;
			_this.specialKeys[e.key] = true;
		};

		_this.onKeyUp = function (e) {
			if (!_this.specialKeys.hasOwnProperty(e.key)) return;
			_this.specialKeys[e.key] = false;
		};

		var defaultOptions = {
			formSelector: 'form[data-swup-form]'
		};

		_this.options = _extends({}, defaultOptions, options);

		/**
   * Helps detecting form submits to a new tab
   */
		_this.specialKeys = {
			Meta: false,
			Control: false,
			Shift: false
		};
		return _this;
	}

	_createClass(FormPlugin, [{
		key: 'mount',
		value: function mount() {
			var swup = this.swup;

			// add empty handlers array for submitForm event
			swup._handlers.submitForm = [];
			swup._handlers.openFormSubmitInNewTab = [];

			// Register the submit handler. Using `capture:true` to be
			// able to set the form's target attribute on the fly.
			swup.delegatedListeners.formSubmit = (0, _delegateIt2.default)(document, this.options.formSelector, 'submit', this.beforeFormSubmit.bind(this), {
				capture: true
			});

			document.addEventListener('keydown', this.onKeyDown);
			document.addEventListener('keyup', this.onKeyUp);
		}
	}, {
		key: 'unmount',
		value: function unmount() {
			var swup = this.swup;

			swup.delegatedListeners.formSubmit.destroy();

			document.removeEventListener('keydown', this.onKeyDown);
			document.removeEventListener('keyup', this.onKeyUp);
		}

		/**
   * Handles form 'submit' events during the capture phase
   * @param {SubmitEvent} event
   * @returns {void}
   */

	}, {
		key: 'beforeFormSubmit',
		value: function beforeFormSubmit(event) {
			var _this2 = this;

			var swup = this.swup;

			/**
    * Always trigger the submitForm event,
    * allowing it to be `defaultPrevented`
    */
			swup.triggerEvent('submitForm', event);

			var form = event.target;

			/**
    * Open the form in a new tab if either Command (Mac), Control (Windows) or Shift is pressed.
    * Normalizes behavior across browsers.
    */
			if (this.isSpecialKeyPressed()) {
				this.resetSpecialKeys();

				swup.triggerEvent('openFormSubmitInNewTab', event);

				var previousFormTarget = form.getAttribute('target');

				form.setAttribute('target', '_blank');

				form.addEventListener('submit', function (event) {
					requestAnimationFrame(function () {
						_this2.restorePreviousFormTarget(event.target, previousFormTarget);
					});
				}, { once: true });

				return;
			}

			this.submitForm(event);
		}

		/**
   * Restores the previous form target if available
   * @param {HTMLFormElement} form
   * @returns {void}
   */

	}, {
		key: 'restorePreviousFormTarget',
		value: function restorePreviousFormTarget(form, previousTarget) {
			if (previousTarget) {
				form.setAttribute('target', previousTarget);
			} else {
				form.removeAttribute('target');
			}
		}

		/**
   * Submits a form through swup
   * @param {SubmitEvent} event
   * @returns {void}
   */

	}, {
		key: 'submitForm',
		value: function submitForm(event) {
			var swup = this.swup;

			event.preventDefault();

			var form = event.target;
			var data = new FormData(form);
			var action = form.getAttribute('action') || window.location.href;
			var method = (form.getAttribute('method') || 'get').toUpperCase();
			var customTransition = form.getAttribute('data-swup-transition');

			var link = new _helpers.Link(action);
			var hash = link.getHash();
			var url = link.getAddress();

			if (hash) {
				swup.scrollToElement = hash;
			}

			if (method === 'GET') {
				url = this.appendQueryParams(url, data);
				swup.cache.remove(url);
				swup.loadPage({ url: url, customTransition: customTransition });
			} else {
				swup.cache.remove(url);
				swup.loadPage({ url: url, method: method, data: data, customTransition: customTransition });
			}
		}

		/**
   * Appends query parameters to a URL
   * @param {string} url
   * @param {FormData} formData
   * @returns {string}
   */

	}, {
		key: 'appendQueryParams',
		value: function appendQueryParams(url, formData) {
			url = url.split('?')[0];
			var query = new URLSearchParams(formData).toString();
			return query ? url + '?' + query : url;
		}

		/**
   * Is either command or control key down at the moment
   * @returns {boolean}
   */

	}, {
		key: 'isSpecialKeyPressed',
		value: function isSpecialKeyPressed() {
			return Object.values(this.specialKeys).some(function (value) {
				return value;
			});
		}

		/**
   * Reset all entries in `specialKeys` to false
   */

	}, {
		key: 'resetSpecialKeys',
		value: function resetSpecialKeys() {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = Object.entries(this.specialKeys)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _step$value = _slicedToArray(_step.value, 2),
					    key = _step$value[0],
					    value = _step$value[1];

					this.specialKeys[key] = false;
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}

		/**
   * Adjust `specialKeys` on keyDown
   * @param {KeyboardEvent} e
   * @returns {void}
   */


		/**
   * Adjust `specialKeys` on keyUp
   * @param {KeyboardEvent} e
   * @returns {void}
   */

	}]);

	return FormPlugin;
}(_plugin2.default);

exports.default = FormPlugin;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Plugin = function () {
    function Plugin() {
        _classCallCheck(this, Plugin);

        this.isSwupPlugin = true;
    }

    _createClass(Plugin, [{
        key: "mount",
        value: function mount() {
            // this is mount method rewritten by class extending
            // and is executed when swup is enabled with plugin
        }
    }, {
        key: "unmount",
        value: function unmount() {
            // this is unmount method rewritten by class extending
            // and is executed when swup with plugin is disabled
        }
    }, {
        key: "_beforeMount",
        value: function _beforeMount() {
            // here for any future hidden auto init
        }
    }, {
        key: "_afterUnmount",
        value: function _afterUnmount() {}
        // here for any future hidden auto-cleanup


        // this is here so we can tell if plugin was created by extending this class

    }]);

    return Plugin;
}();

exports.default = Plugin;

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/** Keeps track of raw listeners added to the base elements to avoid duplication */
const ledger = new WeakMap();
function editLedger(wanted, baseElement, callback, setup) {
    var _a, _b;
    if (!wanted && !ledger.has(baseElement)) {
        return false;
    }
    const elementMap = (_a = ledger.get(baseElement)) !== null && _a !== void 0 ? _a : new WeakMap();
    ledger.set(baseElement, elementMap);
    if (!wanted && !ledger.has(baseElement)) {
        return false;
    }
    const setups = (_b = elementMap.get(callback)) !== null && _b !== void 0 ? _b : new Set();
    elementMap.set(callback, setups);
    const existed = setups.has(setup);
    if (wanted) {
        setups.add(setup);
    }
    else {
        setups.delete(setup);
    }
    return existed && wanted;
}
function isEventTarget(elements) {
    return typeof elements.addEventListener === 'function';
}
function safeClosest(event, selector) {
    let target = event.target;
    if (target instanceof Text) {
        target = target.parentElement;
    }
    if (target instanceof Element && event.currentTarget instanceof Element) {
        // `.closest()` may match ancestors of `currentTarget` but we only need its children
        const closest = target.closest(selector);
        if (closest && event.currentTarget.contains(closest)) {
            return closest;
        }
    }
}
// This type isn't exported as a declaration, so it needs to be duplicated above
function delegate(base, selector, type, callback, options) {
    // Handle Selector-based usage
    if (typeof base === 'string') {
        base = document.querySelectorAll(base);
    }
    // Handle Array-like based usage
    if (!isEventTarget(base)) {
        const subscriptions = Array.prototype.map.call(base, (element) => delegate(element, selector, type, callback, options));
        return {
            destroy() {
                for (const subscription of subscriptions) {
                    subscription.destroy();
                }
            },
        };
    }
    // `document` should never be the base, it's just an easy way to define "global event listeners"
    const baseElement = base instanceof Document ? base.documentElement : base;
    // Handle the regular Element usage
    const capture = Boolean(typeof options === 'object' ? options.capture : options);
    const listenerFn = (event) => {
        const delegateTarget = safeClosest(event, selector);
        if (delegateTarget) {
            event.delegateTarget = delegateTarget;
            callback.call(baseElement, event);
        }
    };
    // Drop unsupported `once` option https://github.com/fregante/delegate-it/pull/28#discussion_r863467939
    if (typeof options === 'object') {
        delete options.once;
    }
    const setup = JSON.stringify({ selector, type, capture });
    const isAlreadyListening = editLedger(true, baseElement, callback, setup);
    const delegateSubscription = {
        destroy() {
            baseElement.removeEventListener(type, listenerFn, options);
            editLedger(false, baseElement, callback, setup);
        },
    };
    if (!isAlreadyListening) {
        baseElement.addEventListener(type, listenerFn, options);
    }
    return delegateSubscription;
}
/* harmony default export */ __webpack_exports__["default"] = (delegate);


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Link = exports.markSwupElements = exports.normalizeUrl = exports.getCurrentUrl = exports.transitionProperty = exports.transitionEnd = exports.fetch = exports.getDataFromHtml = exports.createHistoryRecord = exports.classify = undefined;

var _classify = __webpack_require__(7);

var _classify2 = _interopRequireDefault(_classify);

var _createHistoryRecord = __webpack_require__(8);

var _createHistoryRecord2 = _interopRequireDefault(_createHistoryRecord);

var _getDataFromHtml = __webpack_require__(9);

var _getDataFromHtml2 = _interopRequireDefault(_getDataFromHtml);

var _fetch = __webpack_require__(10);

var _fetch2 = _interopRequireDefault(_fetch);

var _transitionEnd = __webpack_require__(11);

var _transitionEnd2 = _interopRequireDefault(_transitionEnd);

var _transitionProperty = __webpack_require__(12);

var _transitionProperty2 = _interopRequireDefault(_transitionProperty);

var _getCurrentUrl = __webpack_require__(13);

var _getCurrentUrl2 = _interopRequireDefault(_getCurrentUrl);

var _normalizeUrl = __webpack_require__(14);

var _normalizeUrl2 = _interopRequireDefault(_normalizeUrl);

var _markSwupElements = __webpack_require__(15);

var _markSwupElements2 = _interopRequireDefault(_markSwupElements);

var _Link = __webpack_require__(1);

var _Link2 = _interopRequireDefault(_Link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var classify = exports.classify = _classify2.default;
var createHistoryRecord = exports.createHistoryRecord = _createHistoryRecord2.default;
var getDataFromHtml = exports.getDataFromHtml = _getDataFromHtml2.default;
var fetch = exports.fetch = _fetch2.default;
var transitionEnd = exports.transitionEnd = _transitionEnd2.default;
var transitionProperty = exports.transitionProperty = _transitionProperty2.default;
var getCurrentUrl = exports.getCurrentUrl = _getCurrentUrl2.default;
var normalizeUrl = exports.normalizeUrl = _normalizeUrl2.default;
var markSwupElements = exports.markSwupElements = _markSwupElements2.default;
var Link = exports.Link = _Link2.default;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var classify = function classify(text) {
	var output = text.toString().toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
	.replace(/\//g, '-') // Replace / with -
	.replace(/[^\w\-]+/g, '') // Remove all non-word chars
	.replace(/\-\-+/g, '-') // Replace multiple - with single -
	.replace(/^-+/, '') // Trim - from start of text
	.replace(/-+$/, ''); // Trim - from end of text
	if (output[0] === '/') output = output.splice(1);
	if (output === '') output = 'homepage';
	return output;
};

exports.default = classify;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var createHistoryRecord = function createHistoryRecord(url) {
	window.history.pushState({
		url: url || window.location.href.split(window.location.hostname)[1],
		random: Math.random(),
		source: 'swup'
	}, document.getElementsByTagName('title')[0].innerText, url || window.location.href.split(window.location.hostname)[1]);
};

exports.default = createHistoryRecord;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = __webpack_require__(0);

var getDataFromHtml = function getDataFromHtml(html, containers) {
	var fakeDom = document.createElement('html');
	fakeDom.innerHTML = html;
	var blocks = [];

	containers.forEach(function (selector) {
		if ((0, _utils.query)(selector, fakeDom) == null) {
			console.error('Container ' + selector + ' not found on page.');
			return null;
		} else {
			if ((0, _utils.queryAll)(selector).length !== (0, _utils.queryAll)(selector, fakeDom).length) {
				console.warn('Mismatched number of containers found on new page.');
			}
			(0, _utils.queryAll)(selector).forEach(function (item, index) {
				(0, _utils.queryAll)(selector, fakeDom)[index].setAttribute('data-swup', blocks.length);
				blocks.push((0, _utils.queryAll)(selector, fakeDom)[index].outerHTML);
			});
		}
	});

	var json = {
		title: fakeDom.querySelector('title').innerText,
		pageClass: fakeDom.querySelector('body').className,
		originalContent: html,
		blocks: blocks
	};

	// to prevent memory leaks
	fakeDom.innerHTML = '';
	fakeDom = null;

	return json;
};

exports.default = getDataFromHtml;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var fetch = function fetch(setOptions) {
	var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	var defaults = {
		url: window.location.pathname + window.location.search,
		method: 'GET',
		data: null,
		headers: {}
	};

	var options = _extends({}, defaults, setOptions);

	var request = new XMLHttpRequest();

	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			if (request.status !== 500) {
				callback(request);
			} else {
				callback(request);
			}
		}
	};

	request.open(options.method, options.url, true);
	Object.keys(options.headers).forEach(function (key) {
		request.setRequestHeader(key, options.headers[key]);
	});
	request.send(options.data);
	return request;
};

exports.default = fetch;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var transitionEnd = function transitionEnd() {
	if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
		return 'webkitTransitionEnd';
	} else {
		return 'transitionend';
	}
};

exports.default = transitionEnd;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var transitionProperty = function transitionProperty() {
	if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
		return 'WebkitTransition';
	} else {
		return 'transition';
	}
};

exports.default = transitionProperty;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
var getCurrentUrl = function getCurrentUrl() {
	return window.location.pathname + window.location.search;
};

exports.default = getCurrentUrl;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Link = __webpack_require__(1);

var _Link2 = _interopRequireDefault(_Link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var normalizeUrl = function normalizeUrl(url) {
	return new _Link2.default(url).getAddress();
};

exports.default = normalizeUrl;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = __webpack_require__(0);

var markSwupElements = function markSwupElements(element, containers) {
	var blocks = 0;

	containers.forEach(function (selector) {
		if ((0, _utils.query)(selector, element) == null) {
			console.error('Container ' + selector + ' not found on page.');
		} else {
			(0, _utils.queryAll)(selector).forEach(function (item, index) {
				(0, _utils.queryAll)(selector, element)[index].setAttribute('data-swup', blocks);
				blocks++;
			});
		}
	});
};

exports.default = markSwupElements;

/***/ })
/******/ ]);
});