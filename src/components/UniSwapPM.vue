<template lang="html">
  <div>
    <!-- <h4>
      {{ Math.round((vueState.time - pairMarket.reserves[2] * 1000) / 600) }}sec
    </h4> -->
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
      tknA: {
        symbol: String
      },
      tknB: {
        symbol: String
      },
      reserves: {},
      oneA2B: Number,
      oneB2A: Number
    });
    const routerContract = state.contracts.uniswapV2Router01.contract.get(
      state.contracts.uniswapV2Router01.address
    );
    const pairContract = vueState.contracts.uniswapV2Pair.contracts.get(
      props.pmAddress
    );
    const erc20tknA = vueState.contracts.ierc20.contracts.get(props.tknA);
    erc20tknA.methods
      .symbol()
      .call()
      .then(symbol => {
        pairMarket.tknA.symbol = symbol;
      })
      .catch();
    const erc20tknB = vueState.contracts.ierc20.contracts.get(props.tknB);
    erc20tknB.methods
      .symbol()
      .call()
      .then(symbol => {
        pairMarket.tknB.symbol = symbol;
      })
      .catch(console.log);
    watch(
      () => vueState.block.height,
      () => {
        // Now rebuild the fetching data logic
        pairContract.methods
          .getReserves()
          .call()
          .then(reserves => {
            pairMarket.reserves = reserves;
            routerContract.methods
              .getAmountOut(
                1000000,
                pairMarket.reserves[0],
                pairMarket.reserves[1]
              )
              .call()
              .then(amntOut => {
                pairMarket.oneA2B = amntOut / 1000000;
                routerContract.methods
                  .getAmountOut(
                    1000000,
                    pairMarket.reserves[1],
                    pairMarket.reserves[0]
                  )
                  .call()
                  .then(amntOut => {
                    pairMarket.oneB2A = amntOut / 1000000;
                    // Once update is completed vueState.pairMarkets.push({key: props.pmAddress, value: pairMarket})
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
    pmAddress: String,
    possiblePairsIndex: Number
  }
};
</script>

<style lang="css" scoped></style>
