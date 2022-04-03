import * as $ from './symbol';

export default {
	row: {
		[$.NAME]: 'row',
		[$.PROPERTY_POSITION]: 'clientX',
		[$.PROPERTY_SIZE]: 'offsetWidth',
		[$.PROPERTY_OFFSET]: 'offsetLeft',
		[$.STYLE_SIZE]: 'width',
		[$.STYLE_OFFSET]: 'left',
		[$.STYLE_CROSS_SIZE]: 'height',
		[$.STYLE_CROSS_OFFSET]: 'top'
	},
	column: {
		[$.NAME]: 'column',
		[$.PROPERTY_POSITION]: 'clientY',
		[$.PROPERTY_SIZE]: 'offsetHeight',
		[$.PROPERTY_OFFSET]: 'offsetTop',
		[$.STYLE_SIZE]: 'height',
		[$.STYLE_OFFSET]: 'top',
		[$.STYLE_CROSS_SIZE]: 'width',
		[$.STYLE_CROSS_OFFSET]: 'left'
	}
};
