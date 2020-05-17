<template>
  <div id="app">
    <h1>{{ state.contracts.uniswapV2Factory.name }}</h1>
    <h2>Pairs</h2>
    <ul v-for="pair in pairs" :key="pair">
      <PairInfo v-bind:key="pair" v-bind:addr="pair" />
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { reactive } from "@vue/composition-api";
import PairInfo from "./components/PairInfo.vue";
import _state from "./store/state";
import Web3 from "web3";

export default Vue.extend({
  name: "App",
  components: { PairInfo },
  setup() {
    // Establish the sharedState as a reactive(state)
    const state = reactive(_state);
    // Establish a new Ethereum connection a web3 instance in the sharedState
    const web3 = (state.web3 = new Web3(window.ethereum)); // TODO `.ethereum` throws TypErr
    // Now instantiate the contract property uniswapV2Factory
    const uniswapV2Factory = (state.contracts.uniswapV2Factory.contract = new web3.eth.Contract(
      state.contracts.uniswapV2Factory.abi,
      state.contracts.uniswapV2Factory.address[0]
    ));
    state.contracts.uniswapV2Router01.contract = new web3.eth.Contract(
      state.contracts.uniswapV2Router01.abi,
      state.contracts.uniswapV2Router01.address[0]
    );

    uniswapV2Factory.methods
      .allPairsLength()
      .call()
      .then((nPairs: number) => {
        // nPairs TypErr
        let i = 0;
        while (i < nPairs) {
          uniswapV2Factory.methods
            .allPairs(i)
            .call()
            .then((pair: string) => {
              state.contracts.uniswapV2Pair.address.push(pair);
            })
            .catch(console.log);
          i++;
        }

        // TODO After all the pair addrs are stored in sharedState
        // First get tokens associated with each pair
        // Then map tuple(tokenA, tokenB) mapped to the pair addr
      })
      .catch(console.log);

    const pairs = state.contracts.uniswapV2Pair.address;

    return { state, uniswapV2Factory, pairs };
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
