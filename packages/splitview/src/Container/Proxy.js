import { Lang, Object } from '@produck/charon';

import { ContainerContext } from './Context.js';

const DIRECTION_REG = /^(row|column)$/;

export class ContainerProxy {
	constructor() {
		Object.freeze(this);
	}

	get direction() {
		return this[1];
	}

	set direction(value) {
		if (!DIRECTION_REG.test(value)) {
			Lang.Throw.TypeError('Invalid value, `row` or `column` expected.');
		}
	}

	get element() {
		return document.body;
	}

	appendView() {

	}

	removeView() {

	}

	insertBefore(newView, referenceView) {

	}

	mount(element) {

	}

	unmount(element) {

	}

}