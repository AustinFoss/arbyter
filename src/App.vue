<template>
  <div id="app">
    <h1>Arbyter</h1>
    <h3>Unix Epoch: {{ vueState.time }}</h3>
    <h3>
      Time Since Block(#{{ vueState.block.height }}):
      {{ (vueState.time - vueState.block.epoch * 1000) / 1000 }}sec
    </h3>

    <section>
      <h2>UniswapV2</h2>
      <ul v-for="pair in vueState.contracts.uniswapV2Pair.address" :key="pair">
        <PairInfo v-bind:key="pair" v-bind:addr="pair" />
      </ul>
    </section>
    <section>
      <h2>dydx</h2>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { onMounted } from "@vue/composition-api";
import { reactive } from "@vue/composition-api";
import PairInfo from "./components/PairInfo.vue";
import state from "./store/state";
import methods from "./store/methods";

export default Vue.extend({
  name: "App",
  components: { PairInfo },
  setup() {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Establish the sharedState as a reactive(state) for the Vue DApp
    const vueState = reactive(state);
    const vueMethods = methods;
    // Establish a new Ethereum connection a web3 instance in the sharedState
    vueMethods.initWeb3(); // TODO `.ethereum` throws TypErr
    // Instantiate the uniswapV2 webs.eth.Contracts
    vueState.contracts.uniswapV2Factory.contract = vueMethods.newContract(
      vueState.contracts.uniswapV2Factory.abi,
      vueState.contracts.uniswapV2Factory.address[0]
    );
    vueState.contracts.uniswapV2Router01.contract = vueMethods.newContract(
      vueState.contracts.uniswapV2Router01.abi,
      vueState.contracts.uniswapV2Router01.address[0]
    );
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    vueMethods.matchMakePossiblePairs();
    vueMethods.loadDexMarkets();
    onMounted(() => {
      // Start a recursive process that is constantly checking for a new Block
      vueMethods.getBlock();
    });

    return { vueState };
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
