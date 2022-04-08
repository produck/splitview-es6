import * as $ from './symbol';

export const AXIS = {
	row: {
		[$.NAME]: 'row',
		[$.PROPERTY_POSITION]: 'clientX',
		[$.PROPERTY_SIZE]: 'offsetWidth',
		[$.STYLE_SIZE]: 'width',
		[$.STYLE_OFFSET]: 'left',
		[$.CURSOR]: 'col-resize'
	},
	column: {
		[$.NAME]: 'column',
		[$.PROPERTY_POSITION]: 'clientY',
		[$.PROPERTY_SIZE]: 'offsetHeight',
		[$.STYLE_SIZE]: 'height',
		[$.STYLE_OFFSET]: 'top',
	}
};

export const NULL_AXIS = {};