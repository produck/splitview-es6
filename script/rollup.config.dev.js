const path = require('path');
const { defineConfig } = require('rollup');
const { eslint } = require('rollup-plugin-eslint');
const { terser } = require('rollup-plugin-terser');
const serve = require('rollup-plugin-serve');
const html = require('@rollup/plugin-html');

export default defineConfig({
	input: path.join(__dirname, '../test/index.js'),
	output: {
		dir: path.join(__dirname, '../.dev'),
		sourcemap: 'inline',
		format: 'umd',
		name: 'example'
	},
	plugins: [
		terser(),
		eslint(),
		serve({
			host: '127.0.0.1',
			port: 3000,
			contentBase: path.join(__dirname, '../.dev'),
			onListening: function (server) {
				const address = server.address();
				const host = address.address === '::' ? 'localhost' : address.address;

				console.log(`Server listening at http://${host}:${address.port}/`);
			}
		}),
		html(),
	]
});