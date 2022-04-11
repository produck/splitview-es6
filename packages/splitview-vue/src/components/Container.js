import { Container } from '@produck/splitview';
import { WRAP_STYLE } from './utils.js';
import * as Ref from './reference.js';

const DIRECTION_REG = /^(row|column)$/;

/**
 * @type {import('vue').ComponentOptions}
 */
export const ContainerComponent = {
	render(createElement) {
		return createElement('div', {
			class: 'sv-vue',
			style: WRAP_STYLE,
		}, this.$slots.default);
	},
	name: 'sv-container',
	watch: {
		direction() {
			this.commitDirection();
		}
	},
	methods: {
		commitDirection() {
			Ref._c(this).direction = this.direction;
		}
	},
	props: {
		direction: {
			type: String,
			default: 'row',
			validator: value => DIRECTION_REG.test(value)
		}
	},
	beforeMount() {
		Ref.set(this, new Container());
	},
	mounted() {
		Ref._c(this).mount(this.$el);
		this.commitDirection();
	},
	destroyed() {
		Ref._c(this).destroy();
	}
};
