# Swup Forms Plugin

A [swup](https://swup.js.org) plugin for submitting forms.

- Serialize and submit forms with animated page transitions
- Opt-in with a configurable selector, by default `form[data-swup-form]`
- Respects custom animations set on the form element

**Note:** This plugin is perfect for simple scenarios like search or
contact forms. For complex requirements like file uploads or custom
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

## Server response

Action, method and encoding type attributes set on the form are respected.

The server response must be a valid page with all containers to be replaced by swup.

## Custom animations

The plugin respects custom animations set on the form using the `data-swup-animation` attribute:

```html
<!-- Animate with an 'overlay' custom animation -->
<form action="/" data-swup-form data-swup-animation="overlay">
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
swup.hooks.on('form:submit', (visit, { el, event }) => {
  console.log(el);
});
```

### `form:submit:newtab`

Triggered when a form is submitted to a new tab or window. This will happen if the user
has pressed either the `Command` (Mac), `Control` (Windows) or `Shift` key while submitting
the form. The plugin normalizes that behavior across browsers.
