import Vue from "vue";
import App from "./App.vue";
import VueCompAPI from "@vue/composition-api";

Vue.use(VueCompAPI);
Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
