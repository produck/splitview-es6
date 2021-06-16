import { Splitview } from '../index';

window.addEventListener('load', function () {
	const workbenchElement = document.createElement('div');
	const container = Splitview();

	console.log(window.a = container);

	document.body.appendChild(workbenchElement);
	workbenchElement.id = '#app-workbench';
	workbenchElement.style.setProperty('position', 'fixed');
	workbenchElement.style.setProperty('top', '0');
	workbenchElement.style.setProperty('left', '0');
	workbenchElement.style.setProperty('width', '100%');
	workbenchElement.style.setProperty('height', '100%');

	const style = document.createElement('style');

	style.innerText = '.sv-view { box-shadow: 0 0 0 1px inset #000 }';
	document.head.appendChild(style);

	[
		{ name: 'feature-button', min: 48, max: 48 },
		// { name: 'feature-panel-0', min: 50 },
		// { name: 'feature-panel-0', min: 50 },
		{ name: 'feature-panel-0', min: 50 },
		{ name: 'feature-panel-0', min: 50 },
		{ name: 'feature-panel-0', min: 50 },
		{ name: 'feature-panel-0', min: 50 },
		// { name: 'feature-panel-1', max: 400, min: 0 },
		// { name: 'feature-panel-2', max: 300, min: 50 },
		// { name: 'desktop', max: 500, min: 200 }
	].forEach((viewOptions, index) => {
		const view = container.createView(viewOptions);

		container.appendView(view);
		index;
		// view.element.addEventListener('view-size-change', event => console.log(event, viewOptions, index));
	});

	container.element.addEventListener('container-size-change', function (event) {
		console.log('container size:', event);
		// container.relayout();
	});

	container.mount(workbenchElement);
});