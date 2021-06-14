import { normalizeViewOptions } from './normalize';
import { SplitviewView, EndpointView } from './View';
import * as utils from './utils';

export function SplitviewContainer() {
	const containerElement = document.createElement('div');
	const handlerContainerElement = document.createElement('div');

	containerElement.className = 'sv-container';
	handlerContainerElement.className = 'sv-handler-container';
	utils.setContainerStyle(containerElement);
	utils.setHandlerContainerStyle(handlerContainerElement);
	containerElement.appendChild(handlerContainerElement);

	let debouncer = null;

	function autoAdjustment() {
		const resizableViewList = [];

		ctx.rear.each('prev', viewCtx => {
			if (viewCtx.options.resizable) {
				resizableViewList.push(viewCtx);
			}
		});

		let freeSize = containerElement[ctx.axis.offsetSize];

		ctx.head.each('next', viewCtx => freeSize -= viewCtx.size);

		resizableViewList.find(view => {
			const delta = view.size + freeSize < view.options.max ? freeSize : view.options.max - view.size;

			view.size += delta;
			freeSize -= delta;

			return freeSize === 0;
		});

		ctx.head.each('next', viewCtx => viewCtx.fixOffset());
		clearTimeout(debouncer);
		debouncer = setTimeout(() => freeSize !== 0 && console.warn(`Splitview: free ${freeSize}.`), 1000);
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
				const event = new UIEvent('container-size-change', { detail: ctx.container});

				containerElement.dispatchEvent(event);
			}

			size.width = width;
			size.height = height;
			observer = window.requestAnimationFrame(observe);
		}());
	}

	function cancelObserveConatinerSize() {
		cancelAnimationFrame(observer);
	}

	function relayout() {
		utils.setStyle(handlerContainerElement, {
			[ctx.axis.crossStyleSize]: '100%',
			[ctx.axis.styleSize]: '0'
		});

		ctx.head.each('next', view => view.relayout());
		autoAdjustment();
	}

	function appendViewCtx(viewCtx) {
		ctx.rear.prev.next = viewCtx;
		viewCtx.prev = ctx.rear.prev;
		viewCtx.next = ctx.rear;
		ctx.rear.prev = viewCtx;
		containerElement.appendChild(viewCtx.viewElement);
		handlerContainerElement.appendChild(viewCtx.handlerElement);
	}

	function removeViewCtx(viewCtx) {
		viewCtx.prev.next = viewCtx.next;
		viewCtx.next.prev = viewCtx.prev;
		viewCtx.next = viewCtx.prev = null;
		containerElement.removeChild(viewCtx.viewElement);
		handlerContainerElement.removeChild(viewCtx.handlerElement);
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
			ctx.head.each('next', ctx => ctx.oldSize = ctx.size);
		},
		restore() {
			ctx.head.each('next', ctx => ctx.size = ctx.oldSize);
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
				window.addEventListener('resize', autoAdjustment);
			},
			destroy() {
				containerElement.parentElement.removeChild(containerElement);

				cancelObserveConatinerSize();
				window.removeEventListener('resize', autoAdjustment);
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

					containerElement.insertBefore(newViewCtx.viewElement, referenceViewCtx.viewElement);
					handlerContainerElement.insertBefore(newViewCtx.handlerElement, referenceViewCtx.handlerElement);
				}

				relayout();

				return newView;
			},
			createView(options) {
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