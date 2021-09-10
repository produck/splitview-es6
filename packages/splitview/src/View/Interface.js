import { SplitviewViewContext } from './Context';

import * as $V from './symbol';
import * as $C from '../Container/symbol';

/**
 * @type {WeakMap<SplitviewViewInterface, SplitviewViewContext>}
 */
const map = new WeakMap();

/**
 * @param {SplitviewViewInterface} iView
 */
export const _ = iView => map.get(iView);

export class SplitviewViewInterface {
	/**
	 * @param {import('../Container/Context').SplitviewContainerContext} containerContext
	 */
	constructor(containerContext) {
		map.set(this, new SplitviewViewContext(this, containerContext));
		Object.seal(this);
	}

	get element() {
		return _(this)[$V.VIEW_ELEMENT];
	}

	get container() {
		return _(this)[$V.CONTAINER][$C.INTERFACE];
	}

	get previousSibling() {
		return _(this)[$V.PREVIOUS][$V.INTERFACE];
	}

	get nextSibling() {
		return _(this)[$V.NEXT][$V.INTERFACE];
	}

	get size() {
		return _(this)[$V.SIZE];
	}

	get min() {
		return _(this)[$V.MIN];
	}

	set min(value) {
		if (typeof value !== 'number') {
			throw new Error('A number expected.');
		}

		value = Math.trunc(value);

		if (this.size < value) {
			this.setSize(value);
		}

		_(this)[$V.MIN] = value;
	}

	get max() {
		return _(this)[$V.MAX];
	}

	set max(value) {
		if (typeof value !== 'number') {
			throw new Error('A number expected.');
		}

		value = Math.trunc(value);

		if (this.size > value) {
			this.setSize(value);
		}

		_(this)[$V.MAX] = value;
	}

	setSize(value) {
		if (typeof value !== 'number') {
			throw new Error('A view size MUST be a number.');
		}

	}
}