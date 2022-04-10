import { WRAP_STYLE } from './utils.js';
import * as Ref from './reference.js';
import { Type } from '@produck/charon';

function isNotNaN(value) {
	return !isNaN(Number(value));
}

const observer = new ResizeObserver(entries => {
	for (const entry of entries) {
		const viewComponent = Ref._V(entry.target);
		const view = Ref._v(viewComponent);

		viewComponent.$emit('input', view.size);
	}
});

/**
 * @type {import('vue').ComponentOptions}
 */
export const ViewComponent = {
	name: 'sv-view',
	render(createElement) {
		return createElement('div', { style: WRAP_STYLE, }, this.$slots.default);
	},
	watch: {
		value(size) {
			this.setSize(Number(size));
		}
	},
	methods: {
		setSize(value) {
			if (typeof value !== 'number') {
				throw new Error('A view size MUST be a number.');
			}

			const view = Ref._v(this);
			const freeSize = view.setSize(value);

			this.$emit('input', view.size);

			return freeSize;
		}
	},
	beforeMount() {
		const view = Ref._c(this.$parent).createView();

		Ref.set(this, view);
		Ref.set(view.element, this);
		observer.observe(view.element);
	},
	mounted() {
		const view = Ref._v(this);

		view.min = Number(this.min);
		view.max = Number(this.max);
		view.element.appendChild(this.$el);
		Ref._c(this.$parent).appendView(view);

		if (Type.Not.Null(this.init)) {
			this.$nextTick(() => this.setSize(Number(this.init)));
		}
	},
	destroyed() {
		const view = Ref._v(this);

		Ref._c(this.$parent).removeView(view);
		observer.unobserve(view.element);
	},
	beforeCreate() {
		if (!Ref._c(this.$parent)) {
			throw new Error('A `sv-view` parent MUST be a `sv-container`.');
		}
	},
	props: {
		min: {
			type: [Number, String],
			default: 50,
			validator: isNotNaN
		},
		max: {
			type: [Number, String],
			default: window.screen.width * 4,
			validator: isNotNaN
		},
		init: {
			type: [Number, String, null],
			default: null,
			validator: isNotNaN
		},
		value: {
			type: [Number, String],
			default: 50
		}
	}
};
