import * as Dom from '../utils/dom';
import * as Style from './style';

import { SplitviewBaseViewContext } from '../View/Context';
import { MAP as AXIS_MAP } from '../Axis';

import * as $C from './symbol';
import * as $V from '../View/symbol';
import * as $a from '../Axis/symbol';

export class SplitviewContainerContext {
	/**
	 * @param {import('./Interface').SplitviewContainerInterface} containerInterface
	 */
	constructor(containerInterface) {
		this[$C.INTERFACE] = containerInterface;

		const
			viewContainerElement = Dom.createDivElement(),
			handlerContainerElement = Dom.createDivElement();

		Dom.setClassName(viewContainerElement, 'sv-container');
		Dom.setClassName(handlerContainerElement, 'sv-handler-container');
		Dom.setStyle(viewContainerElement, Style.FIXED_VIEW_CONTAINER_STYLE);
		Dom.setStyle(handlerContainerElement, Style.FIXED_HANDLER_CONTAINER_STYLE);
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
			//TODO view ADJUST
			this[$C.ADJUST]();
		}
	}

	[$C.ADJUST]() {

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
			Dom.removeChild(viewContainerElement.parentElement, viewContainerElement);
		}
	}

	/**
	 * @param {import('../View/Context').SplitviewViewContext} view
	 */
	[$C.APPEND_VIEW](view) {
		view[$V.PREVIOUS] = this[$C.REAR_VIEW][$V.PREVIOUS];
		view[$V.NEXT] = this[$C.REAR_VIEW];
		this[$C.REAR_VIEW][$V.PREVIOUS] = this[$C.REAR_VIEW][$V.PREVIOUS][$V.NEXT] =  view;
		Dom.appendChild(this[$C.VIEW_CONTAINER_ELEMENT], view[$V.VIEW_ELEMENT]);
		Dom.appendChild(this[$C.HANDLER_CONTAINER_ELEMENT], view[$V.HANDLER_ELEMENT]);
	}

	/**
	 * @param {import('../View/Context').SplitviewViewContext} view
	 */
	[$C.REMOVE_VIEW](view) {
		view[$V.PREVIOUS][$V.NEXT] = view[$V.NEXT];
		view[$V.NEXT][$V.PREVIOUS] = view[$V.PREVIOUS];
		view[$V.PREVIOUS] = view[$V.NEXT] = null;
		Dom.removeChild(this[$C.VIEW_CONTAINER_ELEMENT], view[$V.VIEW_ELEMENT]);
		Dom.removeChild(this[$C.HANDLER_CONTAINER_ELEMENT], view[$V.HANDLER_ELEMENT]);
	}

	/**
	 * @param {import('../View/Context').SplitviewViewContext} newView
	 * @param {import('../View/Context').SplitviewViewContext} referenceView
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
	 * @param {import('../View/Context').SplitviewViewContext} view
	 */
	[$C.ASSERT_OWNED_VIEW](view, role = null) {
		const list = ['The'];

		if (role) {
			list.push(role);
		}

		list.push('view is NOT in container.');

		if (view[$V.CONTAINER] !== this) {
			throw new Error(list.join(' '));
		}
	}

	[$C.SIZE_MAP]() {
		/**
		 * @type {Map<import('../View/Context').SplitviewViewContext, number>}
		 */
		const map = new Map();

		this[$C.HEAD_VIEW][$V.FOR_EACH](view => map.set(view, view.size));

		return map;
	}
}