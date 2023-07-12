# Swup Forms Plugin

A [swup](https://swup.js.org) plugin for submitting forms.

Forms with a `data-swup-form` attribute will be serialized and submitted by swup,
including page transitions just like normal link clicks.
Set a custom transition name using the `data-swup-transition` attribute on the form element.

The action, method and encoding type attributes set on the form are respected. The server response must be a valid page with all containers to be replaced by swup.

**Note:** This plugin is appropriate for simple use cases like search inputs or
contact forms. For more complex requirements involving file uploads or custom
serialization, it is recommended to use the swup API directly.

## Installation

Install the plugin from npm and import it into your bundle.

```bash
npm install @swup/forms-plugin
```

```js
import SwupFormsPlugin from '@swup/forms-plugin';
```

Or include the minified production file from a CDN:

```html
<script src="https://unpkg.com/@swup/forms-plugin@3"></script>
```

## Usage

To run this plugin, include an instance in the swup options.

```javascript
const swup = new Swup({
  plugins: [new SwupFormsPlugin()]
});
```

## Options

### formSelector

The `formSelector` option defines a selector for forms which should be sent via
swup. By default, any form with a `data-swup-form` attribute is selected.

```javascript
new SwupFormsPlugin({
  formSelector: 'form[data-swup-form]'
});
```

## Hooks

The plugin adds two new hooks to swup.

### `form:submit`

Triggered when a form is submitted.

```js
swup.hooks.on('form:submit', (context, { form, event }) => {
  console.log(form);
});
```

### `form:submit:newtab`

Triggered when a form is submitted to a new tab or window. This will happen if the user
has pressed either the `Command` (Mac), `Control` (Windows) or `Shift` key while submitting
the form. The plugin normalizes that behavior across browsers.

## Browser support

Form submissions are serialized using the
[URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
browser API. If you need to support older browsers such as IE 11, you should add
a [polyfill](https://github.com/ungap/url-search-params).
