import * as utils from './utils';

const GET_SIZE = ctx => ctx.oldSize;
const GET_MIN = ctx => ctx.options.min;
const HANDLER_SIZE = 4;

function SUM(ctx, which, getter) {
	let sum = 0;

	ctx.eachSibling(which, sibling => sum += getter(sibling));

	return sum;
}

function ConfigNext(ctx) {
	return {
		pulled: ctx.prev,
		limit: { pull: ctx.prev.options.max, push: SUM(ctx.prev, 'next', GET_MIN) },
		origin: { pull: ctx.prev.size, push: SUM(ctx.prev, 'next', GET_SIZE) }
	};
}

function ConfigPrev(ctx) {
	return {
		pulled: ctx,
		limit: { pull: ctx.options.max, push: SUM(ctx, 'prev', GET_MIN) },
		origin: { pull: ctx.size, push: SUM(ctx, 'prev', GET_SIZE) }
	};
}

export function EndpointView(containerCtx) {
	const protoView = SplitviewView({
		resizable: false, init: 0, max: 0, min: 0
	}, containerCtx);

	const endpointViewCtx = new Object(protoView);

	endpointViewCtx.view = null;

	return endpointViewCtx;
}

export function SplitviewView(options, containerCtx) {
	const el = {
		view: document.createElement('div'),
		handler: document.createElement('div')
	};

	el.view.className = 'sv-view';
	el.handler.className = 'sv-handler';
	utils.setStaticViewOuterStyle(el.view);
	utils.setStaticHandlerStyle(el.handler);

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
		pulled.eachSibling(which, ctx => {
			const delta = ctx.oldSize - freeDelta > ctx.options.min
				? freeDelta : ctx.oldSize - ctx.options.min;

			ctx.size = ctx.oldSize - delta;
			freeDelta -= delta;
		});
	}

	function startResize(event) {
		const initPos = event[containerCtx.axis.pointPos];

		utils.setStyleImportant(document.body, 'cursor', containerCtx.axis.styleCursorValue);
		ctx.resizing = containerCtx.resizing = true;
		containerCtx.storeAllViewSize();

		const Config = { next: ConfigNext(ctx), prev: ConfigPrev(ctx) };

		function updateViewStateWhenMoving(event) {
			const delta = event[containerCtx.axis.pointPos] - initPos;

			/**
			 * - There will be a smaller probability that pointer position moving back
			 *   to the original. Just only `return` means no size adjustment this time
			 *   and may cause all sizes of views keeping at a previous state.
			 *
			 * - Restoring sizes of all views every time, avoids creating a dirty state
			 *   when `which` is reversed causing sizes of last views not be restored.
			 */
			containerCtx.restoreAllViewSize();

			if (delta !== 0) {
				const which = delta > 0 ? 'next' : 'prev';

				updateViewState(Math.abs(delta), which, Config[which]);
			}
		}

		window.addEventListener('mousemove', updateViewStateWhenMoving);
		window.addEventListener('mouseup', function endResize() {
			window.removeEventListener('mousemove', updateViewStateWhenMoving);
			window.removeEventListener('mouseup', endResize);
			document.body.style.setProperty('cursor', null);
			ctx.resizing = containerCtx.resizing = false;
			updateHandlerColor();
		});
	}

	function updateHandlerColor(hover) {
		const thisResizing = ctx.resizing && containerCtx.resizing;
		const thisReadyToResize = hover && !containerCtx.resizing;

		el.handler.style.backgroundColor =
			thisResizing || thisReadyToResize ? '#007fd4' : 'transparent';
	}

	function dispatchRequestAdjustment() {
		const event = new Event('request-resize', { bubbles: true });

		event.container = containerCtx.container;
		event.view = ctx.view;
		el.handler.dispatchEvent(event);
	}

	el.handler.addEventListener('mousedown', startResize);
	el.handler.addEventListener('mouseover', () => updateHandlerColor(true));
	el.handler.addEventListener('mouseout', () => updateHandlerColor(false));
	el.handler.addEventListener('dblclick', dispatchRequestAdjustment);

	const ctx = {
		resizing: false,
		oldSize: 0,
		prev: null,
		next: null,
		get options() { return options; },
		get viewElement() { return el.view; },
		get handlerElement() { return el.handler; },
		get size() { return el.view[containerCtx.axis.offsetSize]; },
		get offset() { return el.view[containerCtx.axis.offset]; },
		set size(value) {
			if (ctx.size === value) { return; }

			const event = new UIEvent('view-size-change', { detail: ctx.view });

			el.view.style.setProperty(containerCtx.axis.styleSize, `${value}px`);
			ctx.eachSibling('next', sibling => sibling.fixOffset());
			el.view.dispatchEvent(event);
		},
		eachSibling(which, callback) {
			let sibling = ctx[which];

			while (sibling !== null && sibling.next !== null) {
				callback(sibling);
				sibling = sibling[which];
			}
		},
		fixOffset() {
			const offset = ctx.prev.offset + ctx.prev.size;

			el.view.style.setProperty(containerCtx.axis.styleOffset, `${offset}px`);
			el.handler.style.setProperty(containerCtx.axis.styleOffset, `${offset - HANDLER_SIZE / 2}px`);
		},
		updateLayout() {
			utils.setStyleImportant(el.view, containerCtx.axis.crossStyleSize, '100%');
			utils.setStyleImportant(el.view, containerCtx.axis.crossStyleOffset, '0');

			utils.setStyleImportant(el.handler, 'cursor', containerCtx.axis.styleCursorValue);
			utils.setStyleImportant(el.handler, containerCtx.axis.crossStyleSize, '100%');
			utils.setStyleImportant(el.handler, containerCtx.axis.crossStyleOffset, '0');
			utils.setStyleImportant(el.handler, containerCtx.axis.styleSize, `${HANDLER_SIZE}px`);
			utils.setStyleImportant(el.handler, 'display', ctx.prev.options.resizable ? 'block' : 'none');
			ctx.size = ctx.options.min;
		},
		view: Object.seal({
			get container() { return containerCtx.container; },
			get element() { return el.view; },
			get previousSibling() { return ctx.prev.view; },
			get nextSibling() { return ctx.next.view; },
			get size() { return ctx.size; },
			setSize(value) {
				if (typeof value !== 'number') {
					throw new TypeError('A view size MUST be a number.');
				}

				const finalValue = Math.max(Math.min(value, ctx.options.max), ctx.options.min);
				const delta = finalValue - ctx.size;

				if (delta === 0) return;

				containerCtx.storeAllViewSize();

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
