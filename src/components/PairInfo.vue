<template lang="html">
  <div v-if="pair.oneA2B || pair.oneB2A >= 0">
    <h4>{{ pair.tkn0.symbol }}:{{ pair.tkn1.symbol }}</h4>
    <h4>{{ pair.oneA2B }}, {{ pair.oneB2A }}</h4>
  </div>
  <div v-else>
    <h4>Loading</h4>
  </div>
</template>

<script>
import { reactive } from "@vue/composition-api";
import state from "../store/state";
import methods from "../store/methods";

export default {
  name: "PairInfo",
  setup(addr) {
    const vueState = reactive(state);
    const vueMethods = methods;
    const routerContract = vueState.contracts.uniswapV2Router01.contract;
    const pairContract = vueMethods.newContract(
      vueState.contracts.uniswapV2Pair.abi,
      addr.addr //The property with address of this Pair components contract
    );
    state.contracts.uniswapV2Pair.contracts.set(
      addr.addr,
      vueMethods.newContract(vueState.contracts.uniswapV2Pair.abi, addr.addr)
    );
    const pair = reactive({
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
    // This block fetches the pair's token address
    // Then Fetches the pair's reserves with block time-stamp
    pairContract.methods
      .token0()
      .call()
      .then(tkn => {
        pair.tkn0.address = tkn;
        pairContract.methods
          .token1()
          .call()
          .then(tkn => {
            pair.tkn1.address = tkn;
            vueMethods.getPairMarket(routerContract, pairContract, pair);
            // Now with the tkn1.address create a new contract instance
            const tkn1 = (pair.tkn1.contract = vueMethods.newContract(
              vueState.contracts.ierc20.abi,
              pair.tkn1.address
            ));
            tkn1.methods
              .symbol()
              .call()
              .then(symbol => {
                pair.tkn1.symbol = symbol;
              })
              .catch(console.log);
          })
          .catch(console.log);
        // Now with the tkn0.address create a new contract instance
        const tkn0 = (pair.tkn0.contract = vueMethods.newContract(
          vueState.contracts.ierc20.abi,
          pair.tkn0.address
        ));
        tkn0.methods
          .symbol()
          .call()
          .then(symbol => {
            pair.tkn0.symbol = symbol;
          })
          .catch(console.log);
      })
      .catch(console.log);

    return { vueState, pair };
  },
  props: {
    addr: String
  }
};
</script>

<style lang="css" scoped></style>
