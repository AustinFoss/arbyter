<template lang="html">
  <div>
    <p v-if="vueState.possiblePairs[props.possiblePairsIndex].a2b == true">
      {{ pairMarket.oneB2A / 10 ** 18 }}
    </p>
    <p v-else>{{ pairMarket.oneA2B / 10 ** 18 }}</p>
  </div>
</template>

<script>
import { reactive, watch } from "@vue/composition-api";
import state from "../store/state";
import methods from "../store/methods";
export default {
  name: "KyberPM",
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
    watch(
      () => vueState.block.height,
      () => {
        vueState.contracts.kyberNetworkProxy.contract
          .get(state.contracts.kyberNetworkProxy.address)
          .methods.getExpectedRate(props.tknA, props.tknB, 1000000)
          .call()
          .then(amntOut => {
            pairMarket.oneA2B = amntOut.expectedRate;
            vueState.contracts.kyberNetworkProxy.contract
              .get(state.contracts.kyberNetworkProxy.address)
              .methods.getExpectedRate(props.tknB, props.tknA, 1000000)
              .call()
              .then(amntOut => {
                pairMarket.oneB2A = amntOut.expectedRate;
              })
              .catch(console.log);
          })
          .catch(console.log);
      }
    );
    return { vueState, vueMethods, props, pairMarket };
  },
  props: {
    tknA: String,
    tknB: String,
    possiblePairsIndex: Number
  }
};
</script>

<style lang="css" scoped></style>
