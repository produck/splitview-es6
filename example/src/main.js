import Vue from 'vue';
import App from './App.vue';
import SplitviewPlugin from '@produck/splitview-vue';

Vue.config.productionTip = false;
Vue.use(SplitviewPlugin);

new Vue({
	render: function (h) {
		return h(App);
	},
}).$mount('#app');