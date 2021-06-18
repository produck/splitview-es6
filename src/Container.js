import { normalizeViewOptions } from './normalize';
import { SplitviewView, EndpointView, NEXT, PREV } from './View';
import * as utils from './utils';

const HEAD = 0, REAR = 1;

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

		ctx[HEAD].each(NEXT, viewCtx => viewCtxList.push(viewCtx));

		viewCtxList.sort((viewCtxA, viewCtxB) => {
			return (viewCtxA.max - viewCtxA.min) - (viewCtxB.max - viewCtxB.min);
		});

		const finalFreeSize = viewCtxList.reduce((freeSize, viewCtx, index) => {
			const totalSize = viewCtxList.slice(index).reduce((sum, view) => sum + view.size, 0);
			const targetSize = utils.MATH.round(viewCtx.size / totalSize * freeSize);
			const size = utils.getMedian(viewCtx.min, viewCtx.max, targetSize);

			viewCtx.size = size;

			return freeSize - size;
		}, containerElement[ctx.axis.oS]);

		ctx[HEAD].each(NEXT, viewCtx => viewCtx.fixOffset());

		if (finalFreeSize !== 0) {
			debouncer = setTimeout(() => console.warn(`Splitview: free ${finalFreeSize}px`), 1000);
		}
	}

	let observer = null;

	function observeContainerSize() {
		const size = {
			width: containerElement.offsetWidth,
			height: containerElement.offsetHeight
		};

		(function observe() {
			const width = containerElement.offsetWidth;
			const height = containerElement.offsetHeight;

			if (size.width !== width || size.height !== height) {
				autoAdjustment();
				containerElement.dispatchEvent(utils.SplitviewEvent('container-size-change', ctx.container));
			}

			size.width = width;
			size.height = height;
			observer = utils.WIN.requestAnimationFrame(observe);
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

			ctx[HEAD].each(NEXT, view => view.relayout());
			autoAdjustment();
		}
	}

	function appendViewCtx(viewCtx) {
		ctx[REAR][PREV][NEXT] = viewCtx;
		viewCtx[PREV] = ctx[REAR][PREV];
		viewCtx[NEXT] = ctx[REAR];
		ctx[REAR][PREV] = viewCtx;
		containerElement.appendChild(viewCtx.eView);
		handlerContainerElement.appendChild(viewCtx.eHandler);
	}

	function removeViewCtx(viewCtx) {
		viewCtx[PREV][NEXT] = viewCtx[NEXT];
		viewCtx[NEXT][PREV] = viewCtx[PREV];
		viewCtx[NEXT] = viewCtx[PREV] = null;
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
		[HEAD]: null,
		[REAR]: null,
		snapshot() {
			ctx[HEAD].each(NEXT, ctx => ctx._size = ctx.size);
		},
		restore() {
			ctx[HEAD].each(NEXT, ctx => ctx.size = ctx._size);
		},
		container: Object.seal({
			/**
			 * @param {HTMLElement} element
			 */
			set direction(value) {
				if (value !== 'row' && value !== 'column') {
					throw new Error('A direction MUST be `row` or `column`.');
				}

				if (value === ctx.direction) {
					return;
				}

				ctx.direction = value;
				ctx.axis = utils.AXIS_MAP[value];
				relayout();
			},
			get direction() { return ctx.direction; },
			get element() { return containerElement; },
			get firstView() { return ctx[HEAD][NEXT].view; },
			get lastView() { return ctx[REAR][PREV].view; },
			get viewList() {
				const list = [];

				ctx[HEAD].each(NEXT, viewCtx => list.push(viewCtx.view));

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
				relayout();

				return view;
			},
			removeView(view) {
				assertOwned(view);

				const viewCtx = viewWeakMap.get(view);

				if (viewCtx === undefined) {
					throw new Error('The view is NOT in container.');
				}

				removeViewCtx(viewCtx);
				relayout();

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

					newViewCtx[NEXT] = referenceViewCtx;
					newViewCtx[PREV] = referenceViewCtx[PREV];
					referenceViewCtx[PREV][NEXT] = newViewCtx;
					referenceViewCtx[PREV] = newViewCtx;

					containerElement.insertBefore(newViewCtx.eView, referenceViewCtx.eView);
					handlerContainerElement.insertBefore(newViewCtx.eHandler, referenceViewCtx.eHandler);
				}

				relayout();

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

	ctx[HEAD] = EndpointView(ctx);
	ctx[REAR] = EndpointView(ctx);
	ctx[HEAD][NEXT] = ctx[REAR];
	ctx[REAR][PREV] = ctx[HEAD];

	return ctx.container;
}