# Migration Guide: winlet_local v1.x to v2.0

## Overview

v2.0 removes **jQuery**, **Bootstrap**, **Bower**, and **Gulp** from the library. The library is now zero-dependency, built with Rollup, and published via npm only.

**Bundle size impact**: ~265KB (with jQuery + Bootstrap) down to ~40KB.

---

## Installation

### Before (v1.x)

```bash
bower install winlet_local
```

```html
<link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.min.css">
<script src="bower_components/jquery/dist/jquery.min.js"></script>
<script src="bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="bower_components/winlet_local/dist/winlet_local_bootstrap.min.js"></script>
<link rel="stylesheet" href="bower_components/winlet_local/dist/winlet_local.min.css">
```

### After (v2.0)

```bash
npm install winlet-local
```

```html
<script src="node_modules/winlet-local/dist/winlet-local.umd.js"></script>
<link rel="stylesheet" href="node_modules/winlet-local/dist/winlet-local.min.css">
```

Or with a bundler:

```js
import win$ from 'winlet-local';
import 'winlet-local/css';
```

Or via CDN (auto-served from npm):

```html
<script src="https://unpkg.com/winlet-local/dist/winlet-local.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/winlet-local/dist/winlet-local.min.css">
```

jQuery and Bootstrap script/link tags are **no longer needed**.

---

## Breaking Changes

### 1. `win$.jQuery` and `win$.$` Removed

**v1.x** exposed jQuery references on the `win$` object:

```js
win$.jQuery  // the jQuery instance
win$.$       // shorthand for jQuery
```

**v2.0**: These properties no longer exist. Use vanilla JS directly.

**Migration**: Search your project for `win$.jQuery` and `win$.$`. Replace with native DOM APIs:

```js
// Before
win$.$(".my-class").hide();
win$.jQuery.ajax({ url: "/api", success: fn });

// After
document.querySelector(".my-class").style.display = "none";
fetch("/api").then(fn);
```

---

### 2. `win$._find()` Returns DOM Element Instead of jQuery Object

**v1.x**:

```js
var $el = win$._find(element, ".my-selector");
// $el is a jQuery object
$el.html("new content");
$el.addClass("active");
$el.on("click", handler);
$el.find(".child").each(function() { ... });
```

**v2.0**:

```js
var el = win$._find(element, ".my-selector");
// el is a raw DOM element (or null if not found)
el.innerHTML = "new content";
el.classList.add("active");
el.addEventListener("click", handler);
el.querySelectorAll(".child").forEach(function(child) { ... });
```

**Migration**: Search for all `win$._find(` calls and update the code that uses the return value:

| jQuery method on result | Vanilla JS replacement |
|------------------------|----------------------|
| `.html(str)` | `.innerHTML = str` |
| `.text(str)` | `.textContent = str` |
| `.val()` | `.value` |
| `.val(str)` | `.value = str` |
| `.attr("name")` | `.getAttribute("name")` |
| `.attr("name", val)` | `.setAttribute("name", val)` |
| `.data("key")` | `.dataset.key` |
| `.css("prop", val)` | `.style.prop = val` |
| `.addClass("cls")` | `.classList.add("cls")` |
| `.removeClass("cls")` | `.classList.remove("cls")` |
| `.hasClass("cls")` | `.classList.contains("cls")` |
| `.show()` | `.style.display = ""` |
| `.hide()` | `.style.display = "none"` |
| `.find(sel)` | `.querySelector(sel)` or `.querySelectorAll(sel)` |
| `.on("event", fn)` | `.addEventListener("event", fn)` |
| `.off("event", fn)` | `.removeEventListener("event", fn)` |
| `.append(html)` | `.insertAdjacentHTML("beforeend", html)` |
| `.prepend(html)` | `.insertAdjacentHTML("afterbegin", html)` |
| `.empty()` | `.innerHTML = ""` |
| `.remove()` | `.remove()` |
| `.parent()` | `.parentElement` |
| `.closest(sel)` | `.closest(sel)` |
| `.is(sel)` | `.matches(sel)` |
| `.each(fn)` | use `querySelectorAll().forEach(fn)` |
| `.length` | check `!= null` (querySelector) or `.length` (querySelectorAll) |

---

### 3. `win$._container()` and `win$._winlet()` Return DOM Element

Same as `_find()` above -- these now return raw DOM elements instead of jQuery objects.

**v1.x**:

```js
var $container = win$._container(element);
$container.find(".something").text("updated");
```

**v2.0**:

```js
var container = win$._container(element);
container.querySelector(".something").textContent = "updated";
```

---

### 4. `getParams()` No Longer Accepts jQuery Objects

**v1.x**: `win$.getParams()` accepted a jQuery-wrapped form object and called `.is('form')` and `.serialize()` on it.

```js
var params = win$.getParams($myForm, $container);
```

**v2.0**: Pass a raw DOM form element. The method now uses `el instanceof HTMLFormElement` and `new FormData(el)`.

```js
var params = win$.getParams(document.querySelector("form[name='myform']"), container);
```

---

### 5. Form Initialization: `$(form).winform(settings)` Replaced

**v1.x**: Forms were initialized via the jQuery plugin:

```js
$(form).winform({ validate: "yes", container: $container });
```

**v2.0**: Use the standalone function:

```js
win$.winform(formElement, { validate: "yes", container: container });
```

**Note**: Server-rendered forms with `data-winlet-*` attributes are still auto-initialized by the engine. This change only affects manual `winform()` calls in application code.

---

### 6. Menu Plugins: jQuery Plugin Syntax Replaced

**v1.x** (jQuery plugins):

```js
$(trigger).WinletContextMenu("#my-menu", "bottomleft", 5);
$(trigger).WinletClickMenu("#my-menu", "topright");
$(trigger).WinletMenu("click", "#my-menu");
```

**v2.0** (standalone functions):

```js
win$.winletContextMenu(triggerElement, "#my-menu", "bottomleft", 5);
win$.winletClickMenu(triggerElement, "#my-menu", "topright");
win$.winletMenu(triggerElement, "click", "#my-menu");
```

**Migration**: Search for `.WinletContextMenu(`, `.WinletClickMenu(`, `.WinletMenu(` and rewrite.

---

### 7. Menu `menusrc` Data Access Changed

**v1.x**: The trigger element that opened a menu was stored via jQuery data:

```js
var $trigger = $(menu).data("menusrc");
// $trigger is a jQuery object
```

**v2.0**: The trigger is stored as a direct property:

```js
var trigger = menu._menuSrc;
// trigger is a raw DOM element
```

---

### 8. Drag-and-Drop `dragged` Event: Arguments Changed

**v1.x**: The `dragged` event passed extra arguments via jQuery's `.trigger()`:

```js
$(area).on("dragged", function(event, content, location) {
    console.log(content);   // the dragged content element
    console.log(location);  // the drop location object
});
```

**v2.0**: Uses `CustomEvent` with `event.detail`:

```js
area.addEventListener("dragged", function(event) {
    console.log(event.detail.content);    // the dragged content element
    console.log(event.detail.location);   // the drop location object
});
```

---

### 9. `WinletWindowLoaded` Event: Binding Changed

**v1.x**: Listened via jQuery on `document`:

```js
$(document).on("WinletWindowLoaded", function(event) {
    var $container = $(event.target);
    // ...
});
```

**v2.0**: Listened via native API:

```js
document.addEventListener("WinletWindowLoaded", function(event) {
    var container = event.target;  // raw DOM element
    // ...
});
```

---

### 10. Bootstrap CSS Classes No Longer Provided

**v1.x** included Bootstrap 3.x, which provided CSS for:
- Modal styling (`.modal`, `.modal-dialog`, `.modal-content`, etc.)
- Form validation (`.form-group`, `.has-success`, `.has-error`)
- Buttons (`.btn`, `.btn-default`, `.btn-primary`, etc.)
- Grid layout (`.container`, `.row`, `.col-*`)

**v2.0**: The library ships its own modal CSS (`.winlet-modal-*` classes). Bootstrap is no longer bundled.

**Impact on your application**:

#### Modal Styling
No action needed -- the library's custom modal CSS handles this. The modal HTML structure uses new class names internally (`.winlet-modal-dialog`, `.winlet-modal-body`, etc.), but this is transparent since the library generates this HTML.

#### Form Validation Classes
The library still toggles `.has-success` and `.has-error` on `.form-group` and `.winlet-input-group` elements. However, Bootstrap no longer provides the CSS rules for these classes. You need to add your own CSS:

```css
/* Minimal form validation styling (replaces Bootstrap 3) */
.form-group.has-error .form-control,
.winlet-input-group.has-error .form-control {
    border-color: #a94442;
}
.form-group.has-error .control-label,
.form-group.has-error .help-block,
.winlet-input-group.has-error .control-label {
    color: #a94442;
}
.form-group.has-success .form-control,
.winlet-input-group.has-success .form-control {
    border-color: #3c763d;
}
.form-group.has-success .control-label,
.winlet-input-group.has-success .control-label {
    color: #3c763d;
}
```

#### Bootstrap Button/Grid/Component Classes
If your application's HTML (server-rendered Winlet templates) uses Bootstrap CSS classes like `.btn`, `.btn-primary`, `.container`, `.row`, `.col-md-6`, etc., you must either:

1. **Keep Bootstrap CSS** (just the CSS, no JS needed):
   ```html
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/css/bootstrap.min.css">
   ```
2. **Replace with your own CSS** or another CSS framework
3. **Remove Bootstrap classes** from your HTML templates

---

### 11. Dialog Settings JSON: No API Change, But CSS Classes Differ

Dialog settings specified in server responses still work the same way:

```json
{"title": "My Dialog", "width": "600px", "buttons": [{"label": "OK", "class": "btn btn-primary"}]}
```

However, since Bootstrap CSS is no longer loaded, classes like `btn btn-primary` on dialog buttons will have no styling unless you provide your own CSS. You can either:
- Add your own button styles
- Keep Bootstrap CSS loaded (CSS only, no JS)
- Change the server-side templates to use your own class names

---

### 12. Promise Return Values

**v1.x**: Methods like `win$._post()`, `win$._get()`, `win$._submit()`, `win$._toggle()`, `win$._wait()` returned jQuery Deferred promises with `.done()` and `.fail()`:

```js
win$._post(el, null, "save").done(function() {
    console.log("saved");
}).fail(function() {
    console.log("failed");
});
```

**v2.0**: Returns native Promises. Both `.done()/.fail()` (backward compat aliases) and `.then()/.catch()` work:

```js
// Both styles work in v2.0:

// Old style (still supported via aliases)
win$._post(el, null, "save").done(function() { ... });

// New style (native Promise)
win$._post(el, null, "save").then(function() { ... }).catch(function() { ... });
```

---

### 13. `win$._ajax()` Callback Receives Fetch-Compatible Object

**v1.x**: The callback passed to `win$._ajax()` received a jQuery-style config and used `$.ajax()` internally:

```js
win$._ajax(element, function($container) {
    return {
        type: 'POST',
        url: '/api/data',
        data: 'key=value',
        success: function(data, textStatus, jqXHR) {
            var header = jqXHR.getResponseHeader("X-Custom");
        }
    };
});
```

**v2.0**: The same callback format works, but the `jqXHR` object in `success`/`error` callbacks is a lightweight shim. Only `.getResponseHeader(name)` is supported on it:

```js
// The callback format is the same, but jqXHR is a shim:
success: function(data, textStatus, jqXHR) {
    // This still works:
    var header = jqXHR.getResponseHeader("X-Custom");
    // These do NOT work (not a real jqXHR):
    // jqXHR.status
    // jqXHR.responseText
    // jqXHR.setRequestHeader()
}
```

---

### 14. `win$.engine` Internal Methods Return DOM Elements

All `win$.engine` methods that previously returned jQuery objects now return raw DOM elements. This affects application code that calls engine methods directly:

| Method | v1.x Return | v2.0 Return |
|--------|------------|------------|
| `engine.getContainer(el)` | jQuery object | DOM element or null |
| `engine.getWinlet(el)` | jQuery object | DOM element or null |
| `engine.traceToWinlet(el)` | jQuery object | DOM element or null |
| `engine.getRootWinlet(el)` | jQuery object | DOM element or null |
| `engine.getForm(container, name)` | jQuery object | DOM element or null |
| `engine.getDialog(container)` | jQuery object | DOM element or null |

**Checking for "not found"**: In v1.x, you checked `.length == 0`. In v2.0, check `== null`:

```js
// Before
var $container = win$.engine.getContainer(el);
if ($container == null || $container.length == 0) { /* not found */ }

// After
var container = win$.engine.getContainer(el);
if (container == null) { /* not found */ }
```

---

## Quick Migration Checklist

Search your project codebase for the following patterns and update them:

1. **`win$.jQuery`** / **`win$.$`** -- Remove, use vanilla JS
2. **`win$._find(`** -- Update code using the return value (DOM element, not jQuery)
3. **`win$._container(`** / **`win$._winlet(`** -- Same as above
4. **`win$.getParams(`** -- Pass DOM elements, not jQuery objects
5. **`.winform(`** -- Change to `win$.winform(el, settings)`
6. **`.WinletContextMenu(`** -- Change to `win$.winletContextMenu(el, ...)`
7. **`.WinletClickMenu(`** -- Change to `win$.winletClickMenu(el, ...)`
8. **`.WinletMenu(`** -- Change to `win$.winletMenu(el, ...)`
9. **`$(menu).data("menusrc")`** -- Change to `menu._menuSrc`
10. **`"dragged"` event handlers** -- Access `event.detail.content` and `event.detail.location` instead of extra arguments
11. **`"WinletWindowLoaded"` listeners** -- Use `addEventListener` instead of jQuery `.on()`
12. **`$container.length`** -- Change to `container != null` null checks
13. **`.done(`** / **`.fail(`** on promises -- Still works, but consider switching to `.then()` / `.catch()`
14. **Bootstrap CSS classes** in templates -- Add your own CSS or keep Bootstrap CSS loaded
15. **`bower install`** -- Change to `npm install winlet-local`
16. **Script/link tags** -- Update paths (see Installation section above)

---

## Server-Side Winlet Changes

The server-side Winlet framework **does not need changes** for the core functionality. The HTTP protocol between client and server (AJAX requests, response headers like `X-Winlet-Dialog`, `X-Winlet-Update`, etc.) remains identical.

The only server-side consideration is HTML templates:
- If templates use `win$.$` or `win$.jQuery` in inline scripts, update them
- If templates rely on Bootstrap CSS classes for styling, either keep Bootstrap CSS or update the templates
- Dialog settings JSON format is unchanged
- Form `data-winlet-*` attributes are unchanged
- All URL/hash parameter behavior is unchanged
