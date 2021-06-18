# splitview-es6
A simple and pure browser module for creating splitview on page.

## Installing
Using npm,
```bash
$ npm install splitview
```
## Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Splitview Example</title>
	<script src="../dist/splitview.min.js"></script>
	<style>
		#app {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}

		.sv-view {
			box-shadow: 0 0 0 1px inset #000;
		}
	</style>
	<script>
		window.addEventListener('load', function example() {
			// create a container
			const container = splitview.Container();

			// create 4 views and append into container
			[
				// unresizable view
				{ min: 48, max: 48 },
				// default resizable views
				{}, {},
				// with options
				{ min: 100, max: 300 }
			].forEach((viewOptions, index) => {
				const view = container.createView(viewOptions);

				container.appendView(view);
				view.element.appendChild(document.querySelector(`#c-${index}`));
			});

			// mount the container to `div#app`
			container.mount(document.querySelector('#app'));
		});
	</script>
</head>
<body>
	<div id="app"><!-- mounting here --></div>
	<div id="c-0">content 0</div>
	<div id="c-1">content 1</div>
	<div id="c-2">content 2</div>
	<div id="c-3">content 3</div>
</body>
</html>
```

## Concepts

### Axis

### Force style

### Pushing & pulling

### Relayout

### Handler at start end

## API reference

### **Container()**: Container
Creating a new splitview container,
```js
import { Container } from 'splitview';

const container = Container(); // A new container created.
```

### **container.element**: HTMLDivElement
Accessing dom element of this split view, an element class is `sv-view`,
```js
import { Container } from 'splitview';

const container = Container();

console.log(container.element); // An element of container.
```
But it MUST use `container.mount()` to append a container into a document.

### **container.firstView**: View

### **container.lastView**: View

### **container.viewList**: View[]

### **container.createView(options?: ViewOptions)**: View

### **container.appendView(view)**: View

### **container.removeView(view)**: View

### **container.insertBefore(newView, referenceView = null)**: View

### **container.mount(element)**

### **container.destroy()**

### **container.relayout()**

### Event:**'container-size-change'**

### **ViewOptions**

### **view.container**: Container

### **view.element**: HTMLDivElement

### **view.previousSibling**: View

### **view.nextSibling**: View

### **view.size**: number

### **view.setSize(value: number)**: number

### Event:**'view-size-change'**

### Event:**'request-reset'**

## Pre-build

* umd `dist/splitview.min.js`
* esModule `dist/splitview.esm.min.js`
## Browser compatibiliy
Splitview depends on ES6 [weakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap). So a browser version MUST be later than `Chrome 36`, `Edge 12`, `Firefox 6`, `IE 11`, `safari 8`.

## License
MIT