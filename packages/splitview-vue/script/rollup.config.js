import path from 'path';
import { defineConfig } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';

const MODULE_NAME = 'splitview-vue';
const BANNER =
	'/*!\n' +
	` * splitview-vue v${require('../package.json').version}\n` +
	` * (c) 2020-${new Date().getFullYear()} ChaosLee\n` +
	' * Released under the MIT License.\n' +
	' */';

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
	const pluginList = [
		alias({
			entries: [
				{
					find: '@produck/splitview',
					replacement: '@produck/splitview/src/index.js'
				}
			]
		}),
		nodeResolve()
	];

	if (config.isUglify) {
		pluginList.push(terser());
	}

	return defineConfig({
		input: path.resolve('src/index.js'),
		external: [],
		output: {
			file: config.output,
			format: config.format,
			name: config.name,
			banner: BANNER
		},
		plugins: pluginList
	});
});
