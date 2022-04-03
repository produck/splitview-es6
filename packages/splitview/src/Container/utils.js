import { Dom } from '@produck/charon-browser';

export const createDivWithClassName = (name) => {
	const div = Dom.createElement('div');

	Dom.addClass(div, name);

	return div;
};