<template lang="html">
  <div>
    <h4>WIP</h4>
  </div>
</template>

<script>
import { reactive, watch, ref } from "@vue/composition-api";
import state from "../store/state";
import methods from "../store/methods";

export default {
  name: "UniSwapV2",
  setup(props) {
    const vueState = reactive(state);
    const vueMethods = methods;
    let pairMarket = vueState.uniSwapPMdata;
    watch(
      () => vueState.pairMarkets.get(props.pmAddress),
      () => {
        console.log("pm updated");
        pairMarket = vueState.pairMarkets.get(props.pmAddress);
      }
    );
    return { vueState, vueMethods, pairMarket, ref };
  },
  props: {
    tknA: String,
    tknB: String,
    pmAddress: String
  }
};
</script>

<style lang="css" scoped></style>
