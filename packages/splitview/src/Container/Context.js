import { Type } from '@produck/charon';
import { Dom } from '@produck/charon-browser';

import * as View from './View/index.js';
import { AXIS } from './Axis/index.js';
import * as utils from './utils.js';

import * as $ from './symbol.js';
import * as $V from './View/symbol.js';
import * as $A from './Axis/symbol.js';

export class ContainerContext {
	constructor(proxy) {
		this.$ = proxy;

		const viewSlot = utils.createDivWithClassName('sv-container');
		const handlerSlot = utils.createDivWithClassName('sv-handler-container');

		Dom.appendChild(viewSlot, handlerSlot);

		this[$.ELEMENT_VIEW_CONTAINER] = viewSlot;
		this[$.ELEMENT_HANDLER_CONTAINER] = handlerSlot;

		const headView = this[$.VIEW_HEAD] = new View.BaseContext(this);
		const rearView = this[$.VIEW_REAR] = new View.BaseContext(this);

		headView[$V.NEXT] = rearView;
		rearView[$V.PREVIOUS] = headView;

		this[$.AXIS] = AXIS.row;
	}

	get [$.DIRECTION]() {
		return this[$.AXIS][$A.NAME];
	}

	set [$.DIRECTION](value) {
		if (this[$.AXIS][$A.NAME] !== value) {
			this[$.AXIS] = AXIS[value];
		}
	}

	[$.MOUNT](element) {
		Dom.appendChild(element, this[$.ELEMENT_VIEW_CONTAINER]);
	}

	[$.UNMOUNT]() {
		const element = this[$.ELEMENT_VIEW_CONTAINER];
		const { parentElement } = element;

		if (Type.Not.Null(parentElement)) {
			Dom.removeChild(parentElement, element);
		}
	}

	[$.APPEND_VIEW](view) {
		view[$V.PREVIOUS] = this[$.VIEW_REAR][$V.PREVIOUS];
		view[$V.NEXT] = this[$.VIEW_REAR];
		this[$.VIEW_REAR][$V.PREVIOUS][$V.NEXT] = view;
		this[$.VIEW_REAR][$V.PREVIOUS] = view;
		Dom.appendChild(this[$.ELEMENT_VIEW_CONTAINER], view[$V.ELEMENT_VIEW]);
		Dom.appendChild(this[$.ELEMENT_HANDLER_CONTAINER], view[$V.ELEMENT_HANDLER]);
	}

	[$.REMOVE_VIEW](view) {
		view[$V.PREVIOUS][$V.NEXT] = view[$V.NEXT];
		view[$V.NEXT][$V.PREVIOUS] = view[$V.PREVIOUS];
		view[$V.PREVIOUS] = view[$V.NEXT] = null;
		Dom.removeChild(this[$.ELEMENT_VIEW_CONTAINER], view[$V.ELEMENT_VIEW]);
		Dom.removeChild(this[$.ELEMENT_HANDLER_CONTAINER], view[$V.ELEMENT_HANDLER]);
	}

	[$.INSERT_BEFORE](newView, referenceView) {
		newView[$V.NEXT] = referenceView;
		newView[$V.PREVIOUS] = referenceView[$V.PREVIOUS];
		referenceView[$V.PREVIOUS][$V.NEXT] = newView;
		referenceView[$V.PREVIOUS] = newView;

		Dom.insertBefore(
			this[$.ELEMENT_VIEW_CONTAINER],
			newView[$V.ELEMENT_VIEW],
			referenceView[$V.ELEMENT_VIEW]
		);

		Dom.insertBefore(
			this[$.ELEMENT_HANDLER_CONTAINER],
			newView[$V.ELEMENT_HANDLER],
			referenceView[$V.ELEMENT_HANDLER]
		);
	}

	[$.HAS_VIEW](view) {
		return view[$V.CONTAINER] === this;
	}

	[$.RESET]() {

	}
}