import { normalizeViewOptions } from './normalize';
import { SplitviewView, EndpointView } from './View';
import * as utils from './utils';

export function SplitviewContainer() {
	const containerElement = utils.createDivElement();
	const handlerContainerElement = utils.createDivElement();

	utils.setClassName(containerElement, 'sv-container');
	utils.setClassName(handlerContainerElement, 'sv-handler-container');
	utils.setContainerStyle(containerElement);
	utils.setHandlerContainerStyle(handlerContainerElement);
	containerElement.appendChild(handlerContainerElement);

	let debouncer = null;

	function autoAdjustment() {
		clearTimeout(debouncer);

		const viewCtxList = [];

		ctx.head.each('next', viewCtx => viewCtxList.push(viewCtx));

		viewCtxList.sort((viewCtxA, viewCtxB) => {
			return (viewCtxA.max - viewCtxA.min) - (viewCtxB.max - viewCtxB.min);
		});

		const finalFreeSize = viewCtxList.reduce((freeSize, viewCtx, index) => {
			const totalSize = viewCtxList.slice(index).reduce((sum, view) => sum + view.size, 0);
			const targetSize = Math.round(viewCtx.size / totalSize * freeSize);
			const size = Math.max(Math.min(viewCtx.max, targetSize), viewCtx.min);

			viewCtx.size = size;

			return freeSize - size;
		}, containerElement[ctx.axis.oS]);

		ctx.head.each('next', viewCtx => viewCtx.fixOffset());

		if (finalFreeSize !== 0) {
			debouncer = setTimeout(() => console.warn(`Splitview: free ${finalFreeSize}px`), 1000);
		}
	}

	let observer = null;
	let viewChanged = false;

	function observeContainerSize() {
		const size = {
			width: containerElement.offsetWidth,
			height: containerElement.offsetHeight
		};

		(function observe() {
			const width = containerElement.offsetWidth;
			const height = containerElement.offsetHeight;

			if (size.width !== width || size.height !== height) {
				const event = utils.SplitviewEvent('container-size-change', ctx.container);

				autoAdjustment();
				containerElement.dispatchEvent(event);
			}

			if (viewChanged) {
				relayout();
				viewChanged = false;
			}

			size.width = width;
			size.height = height;
			observer = utils.win.requestAnimationFrame(observe);
		}());
	}

	function cancelObserveConatinerSize() {
		cancelAnimationFrame(observer);
	}

	function relayout() {
		if (containerElement.parentElement !== null) {
			utils.setStyle(handlerContainerElement, {
				[ctx.axis.cSS]: '100%',
				[ctx.axis.sS]: '0'
			});

			ctx.head.each('next', view => view.relayout());
			autoAdjustment();
		}
	}

	function appendViewCtx(viewCtx) {
		ctx.rear.prev.next = viewCtx;
		viewCtx.prev = ctx.rear.prev;
		viewCtx.next = ctx.rear;
		ctx.rear.prev = viewCtx;
		containerElement.appendChild(viewCtx.eView);
		handlerContainerElement.appendChild(viewCtx.eHandler);
	}

	function removeViewCtx(viewCtx) {
		viewCtx.prev.next = viewCtx.next;
		viewCtx.next.prev = viewCtx.prev;
		viewCtx.next = viewCtx.prev = null;
		containerElement.removeChild(viewCtx.eView);
		handlerContainerElement.removeChild(viewCtx.eHandler);
	}

	function assertOwned(view) {
		if (view.container !== ctx.container) {
			throw new Error('The view does NOT belongs to this container.');
		}
	}

	const viewWeakMap = new WeakMap();

	const ctx = {
		resizing: false,
		axis: utils.AXIS_MAP.row,
		direction: 'row',
		head: null,
		rear: null,
		snapshot() {
			ctx.head.each('next', ctx => ctx._size = ctx.size);
		},
		restore() {
			ctx.head.each('next', ctx => ctx.size = ctx._size);
		},
		container: Object.seal({
			/**
			 * @param {HTMLElement} element
			 */
			set direction(value) {
				if (value !== 'row' && value !== 'column') {
					throw new Error('A direction MUST be `row` or `column`.');
				}

				ctx.direction = value;
				ctx.axis = utils.AXIS_MAP[value];
				relayout();
			},
			get direction() { return ctx.direction; },
			get element() { return containerElement; },
			get firstView() { return ctx.head.next.view; },
			get lastView() { return ctx.rear.prev.view; },
			get viewList() {
				const list = [];

				ctx.head.each('next', viewCtx => list.push(viewCtx.view));

				return list;
			},
			mount(element) {
				element.appendChild(containerElement);
				relayout();
				observeContainerSize();
			},
			destroy() {
				containerElement.parentElement.removeChild(containerElement);
				cancelObserveConatinerSize();
			},
			relayout,
			appendView(view) {
				assertOwned(view);
				appendViewCtx(viewWeakMap.get(view));
				viewChanged = true;

				return view;
			},
			removeView(view) {
				assertOwned(view);

				const viewCtx = viewWeakMap.get(view);

				if (viewCtx === undefined) {
					throw new Error('The view is NOT in container.');
				}

				removeViewCtx(viewCtx);
				viewChanged = true;

				return view;
			},
			insertBefore(newView, referenceView = null) {
				assertOwned(newView);

				if (referenceView === null) {
					appendViewCtx(viewWeakMap.get(referenceView));
				} else {
					if (referenceView.container !== ctx.container) {
						throw new Error('The reference view does NOT belongs to this container.');
					}

					if (newView.previousSibling !== null) {
						removeViewCtx(viewWeakMap.get(newView));
					}

					const newViewCtx = viewWeakMap.get(newView);
					const referenceViewCtx = viewWeakMap.get(referenceView);

					newViewCtx.next = referenceViewCtx;
					newViewCtx.prev = referenceViewCtx.prev;
					referenceViewCtx.prev.next = newViewCtx;
					referenceViewCtx.prev = newViewCtx;

					containerElement.insertBefore(newViewCtx.eView, referenceViewCtx.eView);
					handlerContainerElement.insertBefore(newViewCtx.eHandler, referenceViewCtx.eHandler);
				}

				viewChanged = true;

				return newView;
			},
			createView(options = {}) {
				if (typeof options !== 'object') {
					throw new Error('An options MUST be an object.');
				}

				const viewCtx = SplitviewView(normalizeViewOptions(options), ctx);

				viewWeakMap.set(viewCtx.view, viewCtx);

				return viewCtx.view;
			}
		})
	};

	ctx.head = EndpointView(ctx);
	ctx.rear = EndpointView(ctx);
	ctx.head.next = ctx.rear;
	ctx.rear.prev = ctx.head;

	return ctx.container;
}