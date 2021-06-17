/*!
 * Splitview v0.1.1
 * (c) 2020-2021 ChaosLee
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.splitview = {}));
}(this, (function (exports) { 'use strict';

	const MAX_WIDTH = window.screen.width * 4;

	function normalizeViewOptions(_options) {
		const options = {
			min: 50,
			max: MAX_WIDTH
		};

		const {
			min: _min = options.min,
			max: _max = options.max,
		} = _options;

		if (_min < 0 || !isFinite(_min)) {
			throw new Error('A min MUST be >= 0 and finity.');
		}

		if (_max < _min) {
			throw new Error('A max MUST >= the min and finity.');
		}

		options.min = _min;
		options.max = _max;

		return options;
	}

	const FIXED_CONTAINER_STYLE = {
		'display': 'block',
		'top': '0',
		'left': '0',
		'position': 'relative',
		'width': '100%',
		'height': '100%',
		'overflow': 'hidden',
		'border': 'none',
		'padding': '0',
		'margin': '0'
	};

	const FIXED_VIEW_OUTER_STYLE = {
		'display': 'block',
		'position': 'absolute',
		'overflow': 'hidden'
	};

	const FIXED_HANDLER_CONTAINER_STYLE = {
		'display': 'block',
		'overflow': 'visible',
		'top': '0',
		'left': '0',
		'position': 'absolute',
		'z-index': '1'
	};

	const FIXED_HANDLER_STYLE = {
		'display': 'block',
		'position': 'absolute',
		'transition-property': 'background-color',
		'transition-duration': '0.2s',
		'transition-delay': '0.1s',
		'user-select': 'none'
	};

	const win = window;
	const doc = document;

	function createDivElement() {
		return doc.createElement('div');
	}

	function setClassName(element, value) {
		element.className = value;
	}

	function addEventListener(element, eventType, listener) {
		element.addEventListener(eventType, listener);
	}

	function removeEventListener(element, eventType, listener) {
		element.removeEventListener(eventType, listener);
	}

	function SplitviewEvent(type, data) {
		const event = new Event(type, { bubbles: true });

		event.data = data;

		return event;
	}

	/**
	 * @param {HTMLDivElement} element
	 */
	function setStyle(element, style) {
		for (const property in style) {
			element.style.setProperty(property, style[property], 'important');
		}
	}

	function setContainerStyle(element) {
		setStyle(element, FIXED_CONTAINER_STYLE);
	}

	function setViewOuterStyle(element) {
		setStyle(element, FIXED_VIEW_OUTER_STYLE);
	}

	function setHandlerContainerStyle(element) {
		setStyle(element, FIXED_HANDLER_CONTAINER_STYLE);
	}

	function setHandlerStyle(element) {
		setStyle(element, FIXED_HANDLER_STYLE);
	}

	const AXIS_MAP = {
		row: {
			p: 'clientX', // position
			cSS: 'height', // cross-style-size
			cSO: 'top', // cross-style-offset
			sS: 'width', // style-size
			sO: 'left', // style-offset
			oS: 'offsetWidth', // offset-size
			o: 'offsetLeft', // offset
			sCV: 'col-resize' // style-cursor-value
		},
		column: {
			p: 'clientY',
			cSS: 'width',
			cSO: 'left',
			sS: 'height',
			sO: 'top',
			oS: 'offsetHeight',
			o: 'offsetTop',
			sCV: 'row-resize'
		},
	};

	const GET_SIZE = ctx => ctx._size;
	const GET_MIN = ctx => ctx.min;
	const HANDLER_SIZE = 4;

	function SUM(ctx, which, getter) {
		let sum = 0;

		ctx.each(which, sibling => sum += getter(sibling));

		return sum;
	}

	function ConfigNext(ctx) {
		return {
			pulled: ctx.prev,
			limit: { pull: ctx.prev.max, push: SUM(ctx.prev, 'next', GET_MIN) },
			origin: { pull: ctx.prev.size, push: SUM(ctx.prev, 'next', GET_SIZE) }
		};
	}

	function ConfigPrev(ctx) {
		return {
			pulled: ctx,
			limit: { pull: ctx.max, push: SUM(ctx, 'prev', GET_MIN) },
			origin: { pull: ctx.size, push: SUM(ctx, 'prev', GET_SIZE) }
		};
	}

	function EndpointView(containerCtx) {
		const protoView = SplitviewView({ max: 0, min: 0 }, containerCtx);
		const endpointViewCtx = new Object(protoView);

		endpointViewCtx.view = null;

		return endpointViewCtx;
	}

	function SplitviewView(options, containerCtx) {
		const handlerElement = createDivElement();
		const viewElement = createDivElement();

		setClassName(viewElement, 'sv-view');
		setClassName(handlerElement, 'sv-handler');
		setViewOuterStyle(viewElement);
		setHandlerStyle(handlerElement);

		function updateViewState(deltaSize, which, state) {
			const { limit, origin, pulled } = state;

			pulled.size = Math.min(
				limit.pull, // !pullable
				origin.pull + origin.push - limit.push, // !pushable
				origin.pull + deltaSize // General
			);

			let freeDelta = pulled.size - origin.pull;

			/**
			 * The pulled & all pushed views MUST be all fixed.
			 * Because number of view changing size a time may be less than last time.
			 * So use `forEach` not `find`. No need for more optimization.
			 */
			pulled.each(which, ctx => {
				const delta = ctx._size - freeDelta > ctx.min
					? freeDelta : ctx._size - ctx.min;

				ctx.size = ctx._size - delta;
				freeDelta -= delta;
			});
		}

		function startResize(event) {
			const initPos = event[containerCtx.axis.p];

			setStyle(doc.body, { 'cursor': containerCtx.axis.sCV });
			ctx.resizing = containerCtx.resizing = true;
			containerCtx.snapshot();

			const Config = { next: ConfigNext(ctx), prev: ConfigPrev(ctx) };

			function updateViewStateWhenMoving(event) {
				const delta = event[containerCtx.axis.p] - initPos;

				/**
				 * - There will be a smaller probability that pointer position moving back
				 *   to the original. Just only `return` means no size adjustment this time
				 *   and may cause all sizes of views keeping at a previous state.
				 *
				 * - Restoring sizes of all views every time, avoids creating a dirty state
				 *   when `which` is reversed causing sizes of last views not be restored.
				 */
				containerCtx.restore();

				if (delta !== 0) {
					const which = delta > 0 ? 'next' : 'prev';

					updateViewState(Math.abs(delta), which, Config[which]);
				}
			}

			addEventListener(win, 'mousemove', updateViewStateWhenMoving);
			addEventListener(win, 'mouseup', function endResize() {
				removeEventListener(win, 'mousemove', updateViewStateWhenMoving);
				removeEventListener(win, 'mouseup', endResize);
				setStyle(doc.body, { 'cursor': 'default' });
				ctx.resizing = containerCtx.resizing = false;
				updateHandlerColor();
			});
		}

		function updateHandlerColor(hover) {
			const resizing = ctx.resizing && containerCtx.resizing;
			const ready = hover && !containerCtx.resizing;
			const highlight = resizing || ready;

			setStyle(handlerElement, highlight ? {
				'background-color': '#007fd4',
				'cursor': containerCtx.axis.sCV,
			} : {
				'background-color': null,
				'cursor': 'default',
			});
		}

		function dispatchRequestAdjustment() {
			const event = SplitviewEvent('request-reset', ctx.view);

			handlerElement.dispatchEvent(event);
		}

		addEventListener(handlerElement, 'mousedown', startResize);
		addEventListener(handlerElement, 'mouseover', () => updateHandlerColor(true));
		addEventListener(handlerElement, 'mouseout', () => updateHandlerColor(false));
		addEventListener(handlerElement, 'dblclick', dispatchRequestAdjustment);

		const ctx = {
			resizing: false,
			_size: 0,
			prev: null,
			next: null,
			get min() { return options.min; },
			get max() { return options.max; },
			get resizable() { return options.max !== options.min; },
			get eView() { return viewElement; },
			get eHandler() { return handlerElement; },
			get size() { return viewElement[containerCtx.axis.oS] || 0.1; },
			get o() { return viewElement[containerCtx.axis.o]; },
			set size(value) {
				if (ctx.size === value) { return; }

				const event = SplitviewEvent('view-size-change', ctx.view);

				setStyle(viewElement, { [containerCtx.axis.sS]: `${value}px` });
				ctx.each('next', sibling => sibling.fixOffset());
				viewElement.dispatchEvent(event);
			},
			each(which, callback) {
				let sibling = ctx[which];

				while (sibling !== null && sibling[which] !== null) {
					callback(sibling);
					sibling = sibling[which];
				}
			},
			fixOffset() {
				const offset = ctx.prev.o + ctx.prev.size;

				setStyle(viewElement, {
					[containerCtx.axis.sO]: `${offset}px`
				});

				setStyle(handlerElement, {
					[containerCtx.axis.sO]: `${offset - HANDLER_SIZE / 2}px `
				});
			},
			relayout() {
				setStyle(viewElement, {
					[containerCtx.axis.cSS]: '100%',
					[containerCtx.axis.cSO]: '0'
				});

				setStyle(handlerElement, {
					[containerCtx.axis.cSS]: '100%',
					[containerCtx.axis.cSO]: '0',
					[containerCtx.axis.sS]: `${HANDLER_SIZE}px`,
					['display']: ctx.prev.resizable ? 'block' : 'none'
				});

				ctx.size = ctx.min;
			},
			view: Object.seal({
				get container() { return containerCtx.container; },
				get element() { return viewElement; },
				get previousSibling() { return ctx.prev.view; },
				get nextSibling() { return ctx.next.view; },
				get size() { return ctx.size; },
				setSize(value) {
					if (typeof value !== 'number') {
						throw new TypeError('A view size MUST be a number.');
					}

					const finalValue = Math.max(Math.min(value, ctx.max), ctx.min);
					const delta = finalValue - ctx.size;

					if (delta === 0) return;

					containerCtx.snapshot();

					const deltaSize = Math.abs(delta);
					const which = delta > 0 ? 'next' : 'prev';

					updateViewState(deltaSize, which, {
						next: ConfigNext,
						prev: ConfigPrev
					}[which](ctx.next));

					return Math.abs(finalValue - ctx.size);
				}
			})
		};

		return ctx;
	}

	function SplitviewContainer() {
		const containerElement = createDivElement();
		const handlerContainerElement = createDivElement();

		setClassName(containerElement, 'sv-container');
		setClassName(handlerContainerElement, 'sv-handler-container');
		setContainerStyle(containerElement);
		setHandlerContainerStyle(handlerContainerElement);
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

		function observeContainerSize() {
			const size = {
				width: containerElement.offsetWidth,
				height: containerElement.offsetHeight
			};

			(function observe() {
				const width = containerElement.offsetWidth;
				const height = containerElement.offsetHeight;

				if (size.width !== width || size.height !== height) {
					const event = SplitviewEvent('container-size-change', ctx.container);

					autoAdjustment();
					containerElement.dispatchEvent(event);
				}

				size.width = width;
				size.height = height;
				observer = win.requestAnimationFrame(observe);
			}());
		}

		function cancelObserveConatinerSize() {
			cancelAnimationFrame(observer);
		}

		function relayout() {
			if (containerElement.parentElement !== null) {
				setStyle(handlerContainerElement, {
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
			axis: AXIS_MAP.row,
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

					if (value === ctx.direction) {
						return;
					}

					ctx.direction = value;
					ctx.axis = AXIS_MAP[value];
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

						newViewCtx.next = referenceViewCtx;
						newViewCtx.prev = referenceViewCtx.prev;
						referenceViewCtx.prev.next = newViewCtx;
						referenceViewCtx.prev = newViewCtx;

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

		ctx.head = EndpointView(ctx);
		ctx.rear = EndpointView(ctx);
		ctx.head.next = ctx.rear;
		ctx.rear.prev = ctx.head;

		return ctx.container;
	}

	exports.Container = SplitviewContainer;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
