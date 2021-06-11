import { normalizeViewOptions } from './normalize';
import SplitviewView, { EndpointView } from './View';
import * as utils from './utils';

export default function SplitviewContainer() {
	const el = {
		container: document.createElement('div'),
		handlerContainer: document.createElement('div')
	};

	el.container.className = 'sv-container';
	el.handlerContainer.className = 'sv-handler-container';
	utils.setStaticContainerStyle(el.container);
	utils.setStaticHandlerContainerStyle(el.handlerContainer);
	el.container.appendChild(el.handlerContainer);

	let debouncer = null;

	function autoAdjustment() {
		const resizableViewList = [];

		ctx.rearViewCtx.eachSibling('prev', viewCtx => {
			if (viewCtx.options.resizable) {
				resizableViewList.push(viewCtx);
			}
		});

		let freeSize = el.container[ctx.axis.offsetSize];

		ctx.headViewCtx.eachSibling('next', viewCtx => freeSize -= viewCtx.size);

		resizableViewList.find(view => {
			const viewMax = view.options.max;
			const delta = view.size + freeSize < viewMax ? freeSize : view.options.max - view.size;

			view.size += delta;
			freeSize -= delta;

			return freeSize === 0;
		});

		ctx.headViewCtx.eachSibling('next', viewCtx => viewCtx.fixOffset());
		clearTimeout(debouncer);
		debouncer = setTimeout(() => freeSize !== 0 && console.warn(`Splitview: free ${freeSize}.`), 1000);
	}

	let observer = null;

	function observeContainerSize() {
		const size = {
			width: el.container.offsetWidth,
			height: el.container.offsetHeight
		};

		(function observe() {
			const width = el.container.offsetWidth;
			const height = el.container.offsetHeight;

			if (size.width !== width || size.height !== height) {
				const event = new UIEvent('container-size-change', { detail: ctx.container});

				el.container.dispatchEvent(event);
			}

			size.width = width;
			size.height = height;
			observer = window.requestAnimationFrame(observe);
		}());
	}

	function cancelObserveConatinerSize() {
		cancelAnimationFrame(observer);
	}

	function updateLayout() {
		utils.setStyleImportant(el.handlerContainer, ctx.axis.crossStyleSize, '100%');
		utils.setStyleImportant(el.handlerContainer, ctx.axis.styleSize, '0');
		ctx.headViewCtx.eachSibling('next', view => view.updateLayout());
		autoAdjustment();
	}

	function appendViewCtx(viewCtx) {
		ctx.rearViewCtx.prev.next = viewCtx;
		viewCtx.prev = ctx.rearViewCtx.prev;
		viewCtx.next = ctx.rearViewCtx;
		ctx.rearViewCtx.prev = viewCtx;
		el.container.appendChild(viewCtx.viewElement);
		el.handlerContainer.appendChild(viewCtx.handlerElement);
	}

	function removeViewCtx(viewCtx) {
		viewCtx.prev.next = viewCtx.next;
		viewCtx.next.prev = viewCtx.prev;
		viewCtx.next = viewCtx.prev = null;
		el.container.removeChild(viewCtx.viewElement);
		el.handlerContainer.removeChild(viewCtx.handlerElement);
	}

	const viewWeakMap = new WeakMap();

	const ctx = {
		resizing: false,
		axis: utils.AXIS_MAP.row,
		direction: 'row',
		headViewCtx: null,
		rearViewCtx: null,
		storeAllViewSize() {
			ctx.headViewCtx.eachSibling('next', ctx => ctx.oldSize = ctx.size);
		},
		restoreAllViewSize() {
			ctx.headViewCtx.eachSibling('next', ctx => ctx.size = ctx.oldSize);
		},
		container: Object.seal({
			/**
			 * @param {HTMLElement} element
			 */
			set direction(value) {
				if (value !== 'row' && value !== 'column') {
					throw new TypeError('A direction MUST be `row` or `column`.');
				}

				ctx.direction = value;
				ctx.symbol = utils.AXIS_MAP[value];
				updateLayout();
			},
			get direction() { return ctx.direction; },
			get firstView() { return ctx.headViewCtx.next.view; },
			get lastView() { return ctx.rearViewCtx.prev.view; },
			get viewList() {
				const list = [];

				ctx.headViewCtx.eachSibling('next', viewCtx => list.push(viewCtx.view));

				return list;
			},
			mount(element) {
				element.appendChild(el.container);
				updateLayout();

				observeContainerSize();
				window.addEventListener('resize', autoAdjustment);
			},
			destroy() {
				el.container.parentElement.removeChild(el.container);

				cancelObserveConatinerSize();
				window.removeEventListener('resize', autoAdjustment);
			},
			relayout() {
				updateLayout();
			},
			appendView(view) {
				if (view.container !== ctx.container) {
					throw new Error('The view does NOT belongs to this container.');
				}

				appendViewCtx(viewWeakMap.get(view));
				updateLayout();

				return view;
			},
			removeView(view) {
				if (view.container !== ctx.container) {
					throw new Error('The view does NOT belongs to this container.');
				}

				const viewCtx = viewWeakMap.get(view);

				if (viewCtx === undefined) {
					throw new Error('The view is NOT in container.');
				}

				removeViewCtx(viewCtx);
				updateLayout();

				return view;
			},
			insertBefore(newView, referenceView = null) {
				if (newView.container !== ctx.container) {
					throw new Error('The new view does NOT belongs to this container.');
				}

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

					el.container.insertBefore(newViewCtx.viewElement, referenceViewCtx.viewElement);
					el.handlerContainer.insertBefore(newViewCtx.handlerElement, referenceViewCtx.handlerElement);
				}

				updateLayout();

				return newView;
			},
			createView(options) {
				const viewCtx = SplitviewView(normalizeViewOptions(options), ctx);

				viewWeakMap.set(viewCtx.view, viewCtx);

				return viewCtx.view;
			}
		})
	};

	ctx.headViewCtx = EndpointView(ctx);
	ctx.rearViewCtx = EndpointView(ctx);
	ctx.headViewCtx.next = ctx.rearViewCtx;
	ctx.rearViewCtx.prev = ctx.headViewCtx;

	return ctx.container;
}