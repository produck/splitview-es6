import '../style.css';
import './example.css';
import { Container } from '../src/index.js';

window.addEventListener('load', function () {
	const workbenchElement = document.createElement('div');
	const container = window.c = new Container();

	document.body.appendChild(workbenchElement);
	workbenchElement.id = 'app-workbench';
	workbenchElement.style.setProperty('position', 'fixed');
	workbenchElement.style.setProperty('top', '0');
	workbenchElement.style.setProperty('left', '0');
	workbenchElement.style.setProperty('width', '100%');
	workbenchElement.style.setProperty('height', '100%');

	[
		{ name: 'feature-button', min: 48, max: 48 },
		// { name: 'feature-panel-0', min: 50 },
		// { name: 'feature-panel-0', min: 50 },
		{ name: 'feature-panel-0', min: 50 },
		{ name: 'feature-panel-0', min: 50 },
		{ name: 'feature-panel-0', min: 50 },
		{ name: 'feature-panel-0', min: 50 },
		// { name: 'feature-panel-1', max: 400, min: 0 },
		{ name: 'feature-panel-2', max: 300, min: 50 },
	].forEach((viewOptions, index) => {
		const { min, max } = viewOptions;
		const view = window.v = container.createView();

		view.min = min;
		view.max = max || 400;

		container.appendView(view);
		index;
	});

	const inserted = window.i = container.createView();

	inserted.min = 200;
	inserted.max = 500;
	container.insertBefore(inserted, v);

	container.mount(workbenchElement);
});