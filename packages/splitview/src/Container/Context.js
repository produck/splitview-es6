import * as Lang from '../utils/lang';
import * as Dom from '../utils/dom';

import { SplitviewBaseViewContext } from '../View/Context';
import { MAP as AXIS_MAP } from '../Axis/index';

import * as $C from './symbol';
import * as $V from '../View/symbol';
import * as $a from '../Axis/symbol';

/** @typedef {import('./Interface').SplitviewContainerInterface} SplitviewContainerInterface */
/** @typedef {import('../View/Context').SplitviewViewContext} SplitviewViewContext */

/**
 * @param {SplitviewViewContext} a
 * @param {SplitviewViewContext} b
 */
const sortViewBySpan = (a, b) => (a[$V.MAX] - a[$V.MIN]) - (b[$V.MAX] - b[$V.MIN]);

/**
 * @param {SplitviewViewContext} view
 */
const fixViewOffset = view =>  view[$V.FIX_OFFSET]();

/**
 * @param {SplitviewViewContext} view
 */
const resetView = view => view[$V.RESET]();

export class SplitviewContainerContext {
	/**
	 * @param {SplitviewContainerInterface} containerInterface
	 */
	constructor(containerInterface) {
		this[$C.INTERFACE] = containerInterface;

		const
			viewContainerElement = Dom.createDivElement(),
			handlerContainerElement = Dom.createDivElement();

		Dom.addClass(viewContainerElement, 'sv-container');
		Dom.addClass(handlerContainerElement, 'sv-handler-container');
		Dom.appendChild(viewContainerElement, handlerContainerElement);

		this[$C.VIEW_CONTAINER_ELEMENT] = viewContainerElement;
		this[$C.HANDLER_CONTAINER_ELEMENT] = handlerContainerElement;

		const
			headView = new SplitviewBaseViewContext(this),
			rearView = new SplitviewBaseViewContext(this);

		headView[$V.NEXT] = rearView;
		rearView[$V.PREVIOUS] = headView;

		this[$C.HEAD_VIEW] = headView;
		this[$C.REAR_VIEW] = rearView;

		/**
		 * @type {'row' | 'column'}
		 */
		this[$C.DIRECTION] = 'row';

		this[$C.ADJUSTMENT_DEBOUNCER] = null;
	}

	get [$C.AXIS]() {
		return AXIS_MAP[this[$C.DIRECTION]];
	}

	[$C.RESET]() {
		Dom.setStyle(this[$C.HANDLER_CONTAINER_ELEMENT], {
			[this[$C.AXIS][$a.CROSS_STYLE_SIZE]]: '100%',
			[this[$C.AXIS][$a.STYLE_SIZE]]: '0'
		});

		if (Dom.hasParentElement(this[$C.VIEW_CONTAINER_ELEMENT])) {
			this[$C.HEAD_VIEW][$V.FOR_EACH](resetView);
			this[$C.ADJUST]();
		}
	}

	[$C.ADJUST]() {
		clearTimeout(this[$C.ADJUSTMENT_DEBOUNCER]);

		/**
		 * @type {SplitviewViewContext[]}
		 */
		const viewList = [];
		const headView = this[$C.HEAD_VIEW];

		headView[$V.FOR_EACH](view => viewList.push(view));
		viewList.sort(sortViewBySpan);

		const finalFreeSize = viewList.reduce((freeSize, view, index) => {
			const totalSize = viewList
				.slice(index)
				.reduce((totalSize, view) => totalSize + view[$V.SIZE], 0);

			const targetSize = Lang.MATH_ROUND(view[$V.SIZE] / totalSize * freeSize);
			const size = Lang.MATH_CLIP(view[$V.MIN], view[$V.MAX], targetSize);

			view[$V.SIZE] = size;

			return freeSize - size;
		});

		headView[$V.FOR_EACH](fixViewOffset);

		if (finalFreeSize > 0) {
			this[$C.ADJUSTMENT_DEBOUNCER] =
				setTimeout(() => console.warn(`Free ${finalFreeSize}px`), 1000);
		}
	}

	/**
	 * @param {HTMLElement} element
	 */
	[$C.MOUNT](element) {
		Dom.appendChild(element, this[$C.VIEW_CONTAINER_ELEMENT]);
	}

	[$C.UNMOUNT]() {
		const viewContainerElement = this[$C.VIEW_CONTAINER_ELEMENT];

		if (Dom.hasParentElement(viewContainerElement)) {
			Dom.removeChild(Dom.getParentElement(viewContainerElement), viewContainerElement);
		}
	}

	/**
	 * @param {SplitviewViewContext} view
	 */
	[$C.APPEND_VIEW](view) {
		view[$V.PREVIOUS] = this[$C.REAR_VIEW][$V.PREVIOUS];
		view[$V.NEXT] = this[$C.REAR_VIEW];
		this[$C.REAR_VIEW][$V.PREVIOUS] = this[$C.REAR_VIEW][$V.PREVIOUS][$V.NEXT] =  view;
		Dom.appendChild(this[$C.VIEW_CONTAINER_ELEMENT], view[$V.VIEW_ELEMENT]);
		Dom.appendChild(this[$C.HANDLER_CONTAINER_ELEMENT], view[$V.HANDLER_ELEMENT]);
	}

	/**
	 * @param {SplitviewViewContext} view
	 */
	[$C.REMOVE_VIEW](view) {
		view[$V.PREVIOUS][$V.NEXT] = view[$V.NEXT];
		view[$V.NEXT][$V.PREVIOUS] = view[$V.PREVIOUS];
		view[$V.PREVIOUS] = view[$V.NEXT] = null;
		Dom.removeChild(this[$C.VIEW_CONTAINER_ELEMENT], view[$V.VIEW_ELEMENT]);
		Dom.removeChild(this[$C.HANDLER_CONTAINER_ELEMENT], view[$V.HANDLER_ELEMENT]);
	}

	/**
	 * @param {SplitviewViewContext} newView
	 * @param {SplitviewViewContext} referenceView
	 */
	[$C.INSERT_BEFORE](newView, referenceView) {
		newView[$V.NEXT] = referenceView;
		newView[$V.PREVIOUS] = referenceView[$V.PREVIOUS];
		referenceView[$V.PREVIOUS][$V.NEXT] = referenceView[$V.PREVIOUS] = newView;

		Dom.insertBefore(
			this[$C.VIEW_CONTAINER_ELEMENT],
			newView[$V.VIEW_ELEMENT],
			referenceView[$V.VIEW_ELEMENT]
		);

		Dom.insertBefore(
			this[$C.HANDLER_CONTAINER_ELEMENT],
			newView[$V.HANDLER_ELEMENT],
			referenceView[$V.HANDLER_ELEMENT]
		);
	}

	/**
	 * @param {SplitviewViewContext} view
	 */
	[$C.ASSERT_OWNED_VIEW](view, role = null) {
		const list = ['The'];

		if (role) {
			list.push(role);
		}

		list.push('view is NOT in container.');

		if (view[$V.CONTAINER] !== this) {
			Lang.THROW(list.join(' '));
		}
	}

	[$C.SIZE_MAP]() {
		/**
		 * @type {Map<SplitviewViewContext, number>}
		 */
		const map = new Map();

		this[$C.HEAD_VIEW][$V.FOR_EACH](view => map.set(view, view.size));

		return map;
	}
}