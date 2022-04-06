import { Console, Math, Type } from '@produck/charon';
import { Dom } from '@produck/charon-browser';

import * as View from './View/index.js';
import * as Handler from './Handler/index.js';
import { AXIS, NULL_AXIS } from './Axis/index.js';
import * as Reference from '../reference.js';
import * as utils from './utils.js';

import * as $ from './symbol.js';
import * as $V from './View/symbol.js';
import * as $H from './Handler/symbol.js';
import * as $A from './Axis/symbol.js';

const TAIL = 0.000001;

export const createHeadRearViewPair = (container) => {
	const head = new View.BaseContext(container);
	const rear = new View.BaseContext(container);

	head[$V.NEXT] = rear;
	rear[$V.PREVIOUS] = head;

	const handler = new Handler.Context(container);

	handler[$H.VIEW_PREVIOUS] = head;
	handler[$H.VIEW_NEXT] = rear;
	head[$V.HANDLER_NEXT] = handler;
	rear[$V.HANDLER_PREVIOUS] = handler;

	Dom.appendChild(container[$.ELEMENT_HANDLER_CONTAINER], handler[$H.ELEMENT]);

	return [head, rear];
};

const observer = new ResizeObserver(entries => {
	for (const containerElement of entries) {
		Reference._(containerElement.target)[$.RESET]();
	}
});

/**
 * Container Structure:
 *
 *     *    +    +    *      - Handler
 *    / \  / \  / \  / \
 *  []---{}---{}---{}---[]   - View
 * HEAD   <-- == -->   REAR
 *   Previous || Next
 */
export class ContainerContext {
	constructor(proxy) {
		this.$ = proxy;

		const viewSlot = utils.createDivWithClassName('sv-container');
		const handlerSlot = utils.createDivWithClassName('sv-handler-container');

		Reference.put(viewSlot, this);
		Dom.appendChild(viewSlot, handlerSlot);

		this[$.ELEMENT_VIEW_CONTAINER] = viewSlot;
		this[$.ELEMENT_HANDLER_CONTAINER] = handlerSlot;

		[this[$.VIEW_HEAD], this[$.VIEW_REAR]] = createHeadRearViewPair(this);

		this[$.AXIS] = NULL_AXIS;
		this[$.DIRECTION] = 'row';
	}

	get [$.SIZE]() {
		return this[$.ELEMENT_VIEW_CONTAINER][this[$.AXIS][$A.PROPERTY_SIZE]];
	}

	get [$.DIRECTION]() {
		return this[$.AXIS][$A.NAME];
	}

	set [$.DIRECTION](value) {
		const originAxisName = this[$.AXIS][$A.NAME];

		if (originAxisName !== value) {
			const containerElement = this[$.ELEMENT_VIEW_CONTAINER];

			Dom.removeClass(containerElement, `sv-${originAxisName}`);
			Dom.addClass(containerElement, `sv-${value}`);
			this[$.AXIS] = AXIS[value];
			this[$.RESET]();
		}
	}

	[$.HAS_VIEW](view) {
		return view[$V.CONTAINER] === this;
	}

	[$.MOUNT](element) {
		observer.observe(this[$.ELEMENT_VIEW_CONTAINER]);
		Dom.appendChild(element, this[$.ELEMENT_VIEW_CONTAINER]);
		this[$.RESET]();
	}

	[$.UNMOUNT]() {
		const element = this[$.ELEMENT_VIEW_CONTAINER];
		const { parentElement } = element;

		if (Type.Not.Null(parentElement)) {
			observer.unobserve(this[$.ELEMENT_VIEW_CONTAINER]);
			Dom.removeChild(parentElement, element);
		}
	}

	[$.INSERT](newView, referenceView) {
		const handler = new Handler.Context();
		const previousView = referenceView[$V.PREVIOUS];
		const previousHandler = referenceView[$V.HANDLER_PREVIOUS];

		newView[$V.PREVIOUS] = previousView;
		previousView[$V.NEXT] = newView;
		newView[$V.NEXT] = referenceView;
		referenceView[$V.PREVIOUS] = newView;

		newView[$V.HANDLER_PREVIOUS] = previousHandler;
		previousHandler[$H.VIEW_NEXT] = newView;
		newView[$V.HANDLER_NEXT] = handler;
		handler[$H.VIEW_PREVIOUS] = newView;
		referenceView[$V.HANDLER_PREVIOUS] = handler;
		handler[$H.VIEW_NEXT] = referenceView;

		Dom.appendChild(this[$.ELEMENT_HANDLER_CONTAINER], handler[$H.ELEMENT]);
	}

	[$.APPEND_VIEW](view) {
		this[$.INSERT](view, this[$.VIEW_REAR]);
		Dom.appendChild(this[$.ELEMENT_VIEW_CONTAINER], view[$V.ELEMENT]);

		this[$.RESET]();
	}

	[$.REMOVE_VIEW](view) {
		const {
			[$V.HANDLER_PREVIOUS]: previousHandler,
			[$V.HANDLER_NEXT]: nextHandler,
			[$V.PREVIOUS]: previousView,
			[$V.NEXT]: nextView
		} = view;

		previousView[$V.NEXT] = nextView;
		nextView[$V.PREVIOUS] = previousView;
		previousHandler[$H.VIEW_NEXT] = nextHandler;
		nextView[$V.HANDLER_PREVIOUS] = previousHandler;

		nextHandler[$H.VIEW_PREVIOUS] = nextHandler[$H.VIEW_NEXT] =
			view[$V.PREVIOUS] = view[$V.NEXT] =
			view[$V.HANDLER_PREVIOUS] = view[$V.HANDLER_NEXT] = null;

		Dom.removeChild(this[$.ELEMENT_VIEW_CONTAINER], view[$V.ELEMENT]);
		Dom.removeChild(this[$.ELEMENT_HANDLER_CONTAINER], nextHandler[$H.ELEMENT]);

		this[$.RESET]();
	}

	[$.INSERT_BEFORE](newView, referenceView) {
		this[$.INSERT](newView, referenceView);

		Dom.insertBefore(
			this[$.ELEMENT_VIEW_CONTAINER],
			newView[$V.ELEMENT],
			referenceView[$V.ELEMENT]
		);

		this[$.RESET]();
	}

	[$.SET_VIEW_FINAL_STYLE](view, size, offset) {
		const viewElement = view[$V.ELEMENT];
		const axis = this[$.AXIS];

		utils.setStyle(viewElement, axis[$A.STYLE_SIZE], `${size}px`);
		utils.setStyle(viewElement, axis[$A.STYLE_OFFSET], `${offset}px`);
	}

	[$.UPDATE_HANDLERS]() {
		const axis = this[$.AXIS];

		this[$.VIEW_REAR][$V.HANDLER_PREVIOUS][$H.SET_RESIZABLE](false);
		this[$.VIEW_HEAD][$V.HANDLER_NEXT][$H.SET_RESIZABLE](false);

		let offset = 0;

		for (const handler of this[$.VIEW_HEAD][$V.HANDLER_NEXT][$H.SIBLINGS]()) {
			offset += handler[$H.VIEW_PREVIOUS][$V.SIZE];
			utils.setStyle(handler[$H.ELEMENT], axis[$A.STYLE_OFFSET], `${offset}px`);
		}
	}

	[$.RESET]() {
		if (Type.isNull(this[$.ELEMENT_VIEW_CONTAINER].parentElement)) {
			return;
		}

		const totalSize = this[$.SIZE];
		const record = [];

		let minSize = 0, totalWeight = TAIL;

		for (const view of this[$.VIEW_HEAD][$V.SIBLINGS]()) {
			const min = view[$V.MIN];
			const weight = view[$V.MAX] - min;

			record.push([view, weight, min]);
			minSize += min;
			totalWeight += weight;
		}

		let freeSize = totalSize - minSize, offset = 0;

		if (freeSize > 0) {
			for (const [view, weight, size] of record) {
				const delta = Math.round((weight + TAIL) / totalWeight * freeSize);
				const finalSize = utils.clip(view[$V.MIN], view[$V.MAX], size + delta);
				const finalDelta = finalSize - size;

				freeSize -= finalDelta;
				totalWeight -= weight;
				this[$.SET_VIEW_FINAL_STYLE](view, finalSize, offset);
				offset += finalSize;
			}
		}

		this[$.UPDATE_HANDLERS]();

		if (freeSize > 0) {
			Console.warn(`Free ${freeSize}.`);
		}
	}
}