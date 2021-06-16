import * as utils from './utils';

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

export function EndpointView(containerCtx) {
	const protoView = SplitviewView({ max: 0, min: 0 }, containerCtx);
	const endpointViewCtx = new Object(protoView);

	endpointViewCtx.view = null;

	return endpointViewCtx;
}

export function SplitviewView(options, containerCtx) {
	const handlerElement = utils.createDivElement();
	const viewElement = utils.createDivElement();

	utils.setClassName(viewElement, 'sv-view');
	utils.setClassName(handlerElement, 'sv-handler');
	utils.setViewOuterStyle(viewElement);
	utils.setHandlerStyle(handlerElement);

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

		utils.setStyle(utils.doc.body, { 'cursor': containerCtx.axis.sCV });
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

		utils.addEventListener(utils.win, 'mousemove', updateViewStateWhenMoving);
		utils.addEventListener(utils.win, 'mouseup', function endResize() {
			utils.removeEventListener(utils.win, 'mousemove', updateViewStateWhenMoving);
			utils.removeEventListener(utils.win, 'mouseup', endResize);
			utils.setStyle(utils.doc.body, { 'cursor': 'default' });
			ctx.resizing = containerCtx.resizing = false;
			updateHandlerColor();
		});
	}

	function updateHandlerColor(hover) {
		const resizing = ctx.resizing && containerCtx.resizing;
		const ready = hover && !containerCtx.resizing;

		utils.setStyle(handlerElement, {
			'background-color': resizing || ready ? '#007fd4' : null
		});
	}

	function dispatchRequestAdjustment() {
		const event = utils.SplitviewEvent('request-resize', ctx.view);

		handlerElement.dispatchEvent(event);
	}

	utils.addEventListener(handlerElement, 'mousedown', startResize);
	utils.addEventListener(handlerElement, 'mouseover', () => updateHandlerColor(true));
	utils.addEventListener(handlerElement, 'mouseout', () => updateHandlerColor(false));
	utils.addEventListener(handlerElement, 'dblclick', dispatchRequestAdjustment);

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

			const event = utils.SplitviewEvent('view-size-change', ctx.view);

			utils.setStyle(viewElement, { [containerCtx.axis.sS]: `${value}px` });
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

			utils.setStyle(viewElement, {
				[containerCtx.axis.sO]: `${offset}px`
			});

			utils.setStyle(handlerElement, {
				[containerCtx.axis.sO]: `${offset - HANDLER_SIZE / 2}px `
			});
		},
		relayout() {
			utils.setStyle(viewElement, {
				[containerCtx.axis.cSS]: '100%',
				[containerCtx.axis.cSO]: '0'
			});

			utils.setStyle(handlerElement, {
				['cursor']: containerCtx.axis.sCV,
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
