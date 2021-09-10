import * as $ from './symbol';

export const MAP = {
	row: {
		[$.PROPERTY_POSITION]: 'clientX',
		[$.PROPERTY_SIZE]: 'offsetWidth',
		[$.PROPERTY_OFFSET]: 'offsetLeft',
		[$.STYLE_SIZE]: 'width',
		[$.STYLE_OFFSET]: 'left',
		[$.CROSS_STYLE_SIZE]: 'height',
		[$.CROSS_STYLE_OFFSET]: 'top'
	},
	column: {
		[$.PROPERTY_POSITION]: 'clientY',
		[$.PROPERTY_SIZE]: 'offsetHeight',
		[$.PROPERTY_OFFSET]: 'offsetTop',
		[$.STYLE_SIZE]: 'height',
		[$.STYLE_OFFSET]: 'top',
		[$.CROSS_STYLE_SIZE]: 'width',
		[$.CROSS_STYLE_OFFSET]: 'left'
	}
};
