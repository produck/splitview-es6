import { Math } from '@produck/charon';
import { Dom } from '@produck/charon-browser';

export const createDivWithClassName = (name) => {
	const div = Dom.createElement('div');

	Dom.addClass(div, name);

	return div;
};

export const clip = (min, max, value) => Math.max(Math.min(value, max), min);

export const setStyle = (element, property, value) =>
	element.style.setProperty(property, value);

export const ArrayFrom = Array.from;