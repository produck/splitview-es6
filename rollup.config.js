import path from 'path';
import { defineConfig } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import { eslint } from 'rollup-plugin-eslint';

const MODULE_NAME = 'splitview';

const moduleList = [
	{
		output: path.resolve(`dist/${MODULE_NAME}.esm.js`),
		format: 'es',
		isExternal: true,
	},
	{
		output: path.resolve(`dist/${MODULE_NAME}.esm.min.js`),
		format: 'es',
		isExternal: true,
		isUglify: true
	},
	{
		output: path.resolve(`dist/${MODULE_NAME}.js`),
		format: 'umd',
		name: MODULE_NAME,
	},
	{
		output: path.resolve(`dist/${MODULE_NAME}.min.js`),
		format: 'umd',
		name: MODULE_NAME,
		isUglify: true
	}
];

export default moduleList.map(config => {
	const pluginList = [];

	if (config.isUglify) {
		pluginList.push(terser());
	}

	pluginList.push(eslint({
		throwOnError: true,
		throwOnWarning: true,
		include: ['src/**'],
		exclude: ['node_modules/**']
	}));

	return defineConfig({
		input: path.resolve('index.js'),
		output: {
			file: config.output,
			format: config.format,
			name: config.name
		},
		plugins: pluginList
	});
});
