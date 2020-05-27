<template lang="html">
  <div>
    <p v-if="vueState.possiblePairs[props.possiblePairsIndex].a2b == true">
      {{ pairMarket.oneA2B }}
    </p>
    <p v-else>{{ pairMarket.oneB2A }}</p>
  </div>
</template>

<script>
import { reactive, watch } from "@vue/composition-api";
import state from "../store/state";
import methods from "../store/methods";

export default {
  name: "UniSwapV2",
  setup(props) {
    const vueState = reactive(state);
    const vueMethods = methods;
    const pairMarket = reactive({
      oneA2B: Number,
      oneB2A: Number
    });
    const routerContract = state.contracts.uniswapV2Router01.contract.get(
      state.contracts.uniswapV2Router01.address
    );
    const pairContract = vueState.contracts.uniswapV2Pair.contracts.get(
      vueState.contracts.uniswapV2Pair.address.get(props.tknA + props.tknB)
    );

    watch(
      () => vueState.block.height,
      () => {
        // Now rebuild the fetching data logic
        pairContract.methods
          .getReserves()
          .call()
          .then(reserves => {
            routerContract.methods
              .getAmountOut(1000000, reserves[0], reserves[1])
              .call()
              .then(amntOut => {
                pairMarket.oneA2B = amntOut / 1000000;
                routerContract.methods
                  .getAmountOut(1000000, reserves[1], reserves[0])
                  .call()
                  .then(amntOut => {
                    pairMarket.oneB2A = amntOut / 1000000;
                    vueMethods.saveData(
                      props.tknA,
                      props.tknB,
                      props.dex,
                      pairMarket
                    );
                  })
                  .catch(console.log);
              })
              .catch(console.log);
          })
          .catch(console.log);
      }
    );
    return { vueState, vueMethods, pairMarket, props };
  },
  props: {
    tknA: String,
    tknB: String,
    possiblePairsIndex: Number,
    dex: String
  }
};
</script>

<style lang="css" scoped></style>
