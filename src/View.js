import * as utils from './utils';
import { CONTAINER, DOC, FIX_OFFSET, MATH, RESIZING, WIN, AXIS_MAP } from './symbol';
export const NEXT = 1, PREV = 0;

const GET_SIZE = ctx => ctx._size;
const GET_MIN = ctx => ctx.min;
const HANDLER_SIZE = 4;
const C_WHICH = 9, C_PULLED_VIEW = 8, C_LIMIT = 7, C_ORIGIN = 6;

function SUM(ctx, which, getter) {
	let sum = 0;

	ctx.each(which, sibling => sum += getter(sibling));

	return sum;
}

const Config = {
	[NEXT]: function ConfigNext(ctx) {
		const viewCtx = ctx[PREV];

		return {
			[C_WHICH]: NEXT,
			[C_PULLED_VIEW]: viewCtx,
			[C_LIMIT]: { pull: viewCtx.max, push: SUM(viewCtx, NEXT, GET_MIN) },
			[C_ORIGIN]: { pull: viewCtx.size, push: SUM(viewCtx, NEXT, GET_SIZE) }
		};
	},
	[PREV]: function ConfigPrev(ctx) {
		const viewCtx = ctx;

		return {
			[C_WHICH]: PREV,
			[C_PULLED_VIEW]: viewCtx,
			[C_LIMIT]: { pull: viewCtx.max, push: SUM(viewCtx, PREV, GET_MIN) },
			[C_ORIGIN]: { pull: viewCtx.size, push: SUM(viewCtx, PREV, GET_SIZE) }
		};
	}
};

function computeDistance(a, b) {
	return MATH.trunc(MATH.abs(a - b));
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

	function updateViewState(deltaSize, config) {
		const {
			[C_LIMIT]: limit,
			[C_ORIGIN]: origin,
			[C_PULLED_VIEW]: pulled
		} = config;

		pulled.size = MATH.min(
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
		pulled.each(config[C_WHICH], ctx => {
			const delta = ctx._size - freeDelta > ctx.min
				? freeDelta : ctx._size - ctx.min;

			ctx.size = ctx._size - delta;
			freeDelta -= delta;
		});
	}

	function startResize(event) {
		const { [AXIS_MAP]: axis } = containerCtx;
		const initPos = event[axis.p];

		utils.setStyle(DOC.body, { 'cursor': axis.sCV });
		ctx[RESIZING] = containerCtx[RESIZING] = true;
		containerCtx.snapshot();

		const configMap = {
			[NEXT]: Config[NEXT](ctx),
			[PREV]: Config[PREV](ctx)
		};

		function updateViewStateWhenMoving(event) {
			const delta = event[axis.p] - initPos;

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
				updateViewState(MATH.abs(delta), configMap[delta > 0 ? NEXT : PREV]);
			}
		}

		utils.addEventListener(WIN, 'mousemove', updateViewStateWhenMoving);
		utils.addEventListener(WIN, 'mouseup', function endResize() {
			utils.removeEventListener(WIN, 'mousemove', updateViewStateWhenMoving);
			utils.removeEventListener(WIN, 'mouseup', endResize);
			ctx[RESIZING] = containerCtx[RESIZING] = false;
			updateStyle();
		});
	}

	let hover = false;

	function updateStyle() {
		const resizing = ctx[RESIZING] && containerCtx[RESIZING];
		const ready = hover && !containerCtx[RESIZING];
		const highlight = resizing || ready;

		utils.setStyle(handlerElement, { 'background-color': highlight ? '#007fd4': null });
		utils.setStyle(DOC.body, { 'cursor': highlight ? containerCtx[AXIS_MAP].sCV : 'default' });
	}

	function dispatchRequestAdjustment() {
		handlerElement.dispatchEvent(utils.SplitviewEvent('request-reset', ctx.view));
	}

	utils.addEventListener(handlerElement, 'mouseover', () => hover = true);
	utils.addEventListener(handlerElement, 'mouseout', () => hover = false);
	utils.addEventListener(handlerElement, 'mousedown', startResize);
	utils.addEventListener(handlerElement, 'mouseover', updateStyle);
	utils.addEventListener(handlerElement, 'mouseout', updateStyle);
	utils.addEventListener(handlerElement, 'dblclick', dispatchRequestAdjustment);

	const ctx = {
		[RESIZING]: false,
		_size: 0,
		[PREV]: null,
		[NEXT]: null,
		get min() { return options.min; },
		get max() { return options.max; },
		get resizable() { return options.max !== options.min; },
		get eView() { return viewElement; },
		get eHandler() { return handlerElement; },
		get size() { return viewElement[containerCtx[AXIS_MAP].oS] + 0.01; },
		get o() { return viewElement[containerCtx[AXIS_MAP].o]; },
		set size(value) {
			value = MATH.trunc(value);

			if (ctx.size !== value) {
				utils.setStyle(viewElement, { [containerCtx[AXIS_MAP].sS]: `${value}px` });
				ctx.each(NEXT, sibling => sibling[FIX_OFFSET]());
				viewElement.dispatchEvent(utils.SplitviewEvent('view-size-change', ctx.view));
			}
		},
		each(which, callback) {
			let sibling = ctx[which];

			while (sibling !== null && sibling[which] !== null) {
				callback(sibling);
				sibling = sibling[which];
			}
		},
		[FIX_OFFSET]() {
			const { [AXIS_MAP]: axis } = containerCtx;
			const offset = MATH.trunc(ctx[PREV].o + ctx[PREV].size);

			utils.setStyle(viewElement, {
				[axis.sO]: `${offset}px`
			});

			utils.setStyle(handlerElement, {
				[axis.sO]: `${offset - HANDLER_SIZE / 2}px `
			});
		},
		relayout() {
			const { [AXIS_MAP]: axis } = containerCtx;

			utils.setStyle(viewElement, {
				[axis.cSS]: '100%',
				[axis.cSO]: '0'
			});

			utils.setStyle(handlerElement, {
				[axis.cSS]: '100%',
				[axis.cSO]: '0',
				[axis.sS]: `${HANDLER_SIZE}px`,
				['display']: ctx[PREV].resizable ? 'block' : 'none'
			});

			ctx.size = ctx.min;
		},
		view: Object.seal({
			get container() { return containerCtx[CONTAINER]; },
			get element() { return viewElement; },
			get previousSibling() { return ctx[PREV].view; },
			get nextSibling() { return ctx[NEXT].view; },
			get size() { return MATH.trunc(ctx.size); },
			setSize(value) {
				if (typeof value !== 'number') {
					throw new Error('A view size MUST be a number.');
				}

				const finalValue = utils.getMedian(ctx.min, ctx.max, value);

				/**
				 * Not to set view.size if resizing.
				 */
				if (!containerCtx[RESIZING]) {
					if (computeDistance(finalValue, ctx.size) === 0) return 0;

					containerCtx.snapshot();

					const delta = finalValue - ctx.size;
					const deltaSize = MATH.abs(delta);

					updateViewState(deltaSize, Config[delta > 0 ? NEXT : PREV](ctx[NEXT]));

					if (computeDistance(finalValue, ctx.size) !== 0) {
						const delta = finalValue - ctx.size;
						const deltaSize = MATH.abs(delta);

						updateViewState(deltaSize, Config[delta > 0 ? PREV : NEXT](ctx));
					}
				}

				return computeDistance(finalValue, ctx.size);
			}
		})
	};

	return ctx;
}
