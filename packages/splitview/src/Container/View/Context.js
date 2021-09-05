import * as Dom from '../../utils/dom';
import * as $V from './symbol';
import * as $C from '../symbol';
import * as Style from './style';

export class SplitviewViewContext {
	/**
	 * @param {import('./Interface').SplitviewViewInterface} viewInterface
	 * @param {import('../Context').SplitviewContainerContext} containerContext
	 */
	constructor(viewInterface, containerContext) {
		this[$V.INTERFACE] = viewInterface;
		this[$V.CONTAINER] = containerContext;

		containerContext[$C.VIEW_MAP].set(viewInterface, this);

		const
			viewElement = Dom.createDivElement(),
			handlerElement = Dom.createDivElement();

		Dom.setClassName(viewElement, 'sv-view');
		Dom.setClassName(handlerElement, 'sv-handler');
		Dom.setStyle(viewElement, Style.FIXED_VIEW_STYLE);
		Dom.setStyle(handlerElement, Style.FIXED_HANDLER_STYLE);

		this[$V.VIEW_ELEMENT] = viewElement;
		this[$V.HANDLER_ELEMENT] = handlerElement;

		/**
		 * @type {SplitviewViewContext | null}
		 */
		this[$V.NEXT] = null;

		/**
		 * @type {SplitviewViewContext | null}
		 */
		this[$V.PREVIOUS] = null;

		this[$V.MAX] = 0;
		this[$V.MIN] = 0;
	}

	[$V.UPDATE_VIEW_STATE]() {

	}

	[$V.START_RESIZING]() {

	}
}