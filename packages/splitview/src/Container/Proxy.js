import { Lang, Object } from '@produck/charon';

import { put, _ } from '../reference.js';
import { ContainerContext } from './Context.js';
import { ViewProxy } from './View/Proxy.js';

import * as $ from './symbol.js';
import * as $V from './View/symbol.js';

const DIRECTION_REG = /^(row|column)$/;

const assertView = (view, container, role = 'view') => {
	if (!Lang.instanceOf(view, ViewProxy)) {
		Lang.Throw.TypeError(`Invalid ${role}, a View expected.`);
	}

	if (!_(container)[$.HAS_VIEW](_(view))) {
		Lang.throwError(`The ${role} is NOT from this Container.`);
	}
};

const assertElement = any => {
	if (!Lang.instanceOf(any, Element)) {
		Lang.Throw.TypeError('Invalid element, a HTMLElement expected.');
	}
};

export class ContainerProxy {
	constructor() {
		put(this, new ContainerContext(this));
		Object.freeze(this);
	}

	get element() {
		return _(this)[$.ELEMENT_VIEW_CONTAINER];
	}

	get direction() {
		return _(this)[$.DIRECTION];
	}

	set direction(value) {
		if (!DIRECTION_REG.test(value)) {
			Lang.Throw.TypeError('Invalid value, `row` or `column` expected.');
		}

		_(this)[$.DIRECTION] = value;
	}

	get first() {
		return _(this)[$.VIEW_HEAD][$V.NEXT].$;
	}

	get last() {
		return _(this)[$.VIEW_REAR][$V.PREVIOUS].$;
	}

	*views() {
		for (const view of _(this)[$.VIEW_HEAD][$V.SIBLINGS]()) {
			yield view.$;
		}
	}

	appendView(view) {
		assertView(view, this);
		_(this)[$.APPEND_VIEW](_(view));

		return view;
	}

	removeView(view) {
		assertView(view, this);
		_(this)[$.REMOVE_VIEW](_(view));

		return view;
	}

	insertBefore(newView, referenceView) {
		assertView(newView, this, 'new view');
		assertView(referenceView, this, 'reference view');
		_(this)[$.INSERT_BEFORE](_(newView), _(referenceView));

		return newView;
	}

	mount(element) {
		assertElement(element);
		_(this)[$.MOUNT](element);

	}

	destroy(element) {
		assertElement(element);
		_(this)[$.UNMOUNT]();
	}

	createView() {
		return new ViewProxy(this);
	}
}