import * as Dom from '../utils/dom';
import * as Style from './style';
import * as $C from './symbol';
import * as $V from './View/symbol';
import { MAP as AXIS_MAP, $ as $a } from './axis';

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

		this[$C.SIZE_CHECKING_DEBOUNCER] = null;
		this[$C.SIZE_WATCHER] = null;

		this[$C.RESIZING] = false;

		/**
		 * @type {Map<
		 * 	import('./View/Interface').SplitviewViewInterface,
		 * 	import('./View/Context').SplitviewViewContext
		 * >}
		 */
		this[$C.VIEW_MAP] = new Map();

		/**
		 * @type {'row' | 'column'}
		 */
		this[$C.DIRECTION_FLAG] = 'row';

		this[$C.HEAD_VIEW] = null;
		this[$C.REAR_VIEW] = null;

		this[$C.LAST_WIDTH] = 0;
		this[$C.LAST_HEIGHT] = 0;
	}

	get [$C.AXIS]() {
		return AXIS_MAP[this[$C.DIRECTION_FLAG]];
	}

	set [$C.DIRECTION](value) {
		if (value !== this[$C.DIRECTION]) {
			this[$C.DIRECTION_FLAG] = value;
			this[$C.RESET]();
		}
	}

	get [$C.DIRECTION]() {
		return this[$C.DIRECTION_FLAG];
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

	[$C.UPDATE_LAST_SIZE]() {
		const viewContainerElement = this[$C.VIEW_CONTAINER_ELEMENT];

		if (!Dom.hasParentElement(viewContainerElement)) {
			return;
		}

		const {
			offsetHeight: height,
			offsetWidth: width
		} = viewContainerElement;

		if (this[$C.LAST_WIDTH] !== width || this[$C.LAST_HEIGHT] !== height) {
			this[$C.ADJUST]();
			this[$C.LAST_WIDTH] = width;
			this[$C.LAST_HEIGHT] = height;
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

		Dom.removeChild(viewContainerElement.parentElement, viewContainerElement);
	}

	/**
	 * @param {import('./View/Context').SplitviewViewContext} view
	 */
	[$C.APPEND_VIEW](view) {
		view[$V.PREVIOUS] = this[$C.REAR_VIEW][$V.PREVIOUS];
		view[$V.NEXT] = this[$C.REAR_VIEW];
		this[$C.REAR_VIEW][$V.PREVIOUS] = this[$C.REAR_VIEW][$V.PREVIOUS][$V.NEXT] =  view;
		Dom.appendChild(this[$C.VIEW_CONTAINER_ELEMENT], view[$V.VIEW_ELEMENT]);
		Dom.appendChild(this[$C.HANDLER_CONTAINER_ELEMENT], view[$V.HANDLER_ELEMENT]);
	}

	/**
	 * @param {import('./View/Context').SplitviewViewContext} view
	 */
	[$C.REMOVE_VIEW](view) {
		view[$V.PREVIOUS][$V.NEXT] = view[$V.NEXT];
		view[$V.NEXT][$V.PREVIOUS] = view[$V.PREVIOUS];
		view[$V.PREVIOUS] = view[$V.NEXT] = null;
		Dom.removeChild(this[$C.VIEW_CONTAINER_ELEMENT], view[$V.VIEW_ELEMENT]);
		Dom.removeChild(this[$C.HANDLER_CONTAINER_ELEMENT], view[$V.HANDLER_ELEMENT]);
	}

	/**
	 * @param {import('./View/Context').SplitviewViewContext} view
	 */
	[$C.ASSERT_OWNED_VIEW](view, role = 'view') {
		if (view[$V.CONTAINER] !== this) {
			throw new Error(`The ${role} is NOT in container.`);
		}
	}
}