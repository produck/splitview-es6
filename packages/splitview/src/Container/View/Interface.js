import { SplitviewViewContext } from './Context';
import * as $V from './symbol';
import * as $C from '../symbol';

/**
 * @type {Map<SplitviewViewInterface, SplitviewViewContext>}
 */
const map = new Map();

/**
 * @param {SplitviewViewInterface} iView
 */
export const _ = iView => map.get(iView);

export class SplitviewViewInterface {
	/**
	 * @param {import('../Context').SplitviewContainerContext} containerContext
	 */
	constructor(containerContext) {
		map.set(this, new SplitviewViewContext(this, containerContext));
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

	}

	get min() {

	}

	set min(value) {

	}

	get max() {

	}

	set max(value) {

	}

	destroy() {

	}

	setSize(value) {
		if (typeof value !== 'number') {
			throw new Error('A view size MUST be a number.');
		}

	}
}