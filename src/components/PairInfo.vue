<template lang="html">
  <div v-if="pairMarket.oneA2B || pairMarket.oneB2A >= 0">
    <h4>{{ pairMarket.tkn0.symbol }}:{{ pairMarket.tkn1.symbol }}</h4>
    <h4>{{ pairMarket.oneA2B }}, {{ pairMarket.oneB2A }}</h4>
  </div>
  <div v-else>
    <h4>Loading</h4>
  </div>
</template>

<script>
import { reactive, ref } from "@vue/composition-api";
import state from "../store/state";
import methods from "../store/methods";

export default {
  name: "PairInfo",
  setup(addr) {
    const vueState = reactive(state);
    const vueMethods = methods;
    const routerContract = vueState.contracts.uniswapV2Router01.contract.get(
      vueState.contracts.uniswapV2Router01.address
    );
    state.contracts.uniswapV2Pair.contracts.set(
      addr.addr,
      vueMethods.newContract(vueState.contracts.uniswapV2Pair.abi, addr.addr)
    );
    const pairContract = vueState.contracts.uniswapV2Pair.contracts.get(
      addr.addr
    );
    vueState.pairMarkets.set(addr.addr, {
      tkn0: {
        address: String,
        contract: Object,
        symbol: String
      },
      tkn1: {
        address: String,
        contract: Object,
        symbol: String
      },
      reserves: {},
      oneA2B: Number,
      oneB2A: Number
    });
    const pairMarket = ref(vueState.pairMarkets.get(addr.addr)).value;

    // This block fetches the pair's token address
    // Then Fetches the pair's reserves with block time-stamp
    vueMethods.getPairMarket(
      routerContract,
      pairContract,
      pairMarket,
      addr.addr
    );

    return { vueState, pairMarket };
  },
  props: {
    addr: String
  }
};
</script>

<style lang="css" scoped></style>
