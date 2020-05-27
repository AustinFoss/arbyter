<template lang="html">
  <div>
    <p>Uniswap{{ (pm.a.oneB2A / (pm.b.oneA2B / 10 ** 18)) * 100 }}% of Kyber</p>
  </div>
</template>

<script>
import { reactive, watch } from "@vue/composition-api";
import state from "../store/state";
import methods from "../store/methods";
export default {
  name: "PercentGain",

  setup(props) {
    const vueState = reactive(state);
    const vueMethods = methods;
    const pm = reactive({
      a: {},
      b: {}
    });
    watch(
      () => vueState.pairMarkets,
      () => {
        state.pairMarkets.filter(function(item) {
          if (item["key"] === props.tknA + props.tknB + props.dexA) {
            pm.a = item.data;
          } else if (item["key"] === props.tknA + props.tknB + props.dexB) {
            pm.b = item.data;
          }
        });
      }
    );

    return { props, vueState, vueMethods, pm };
  },
  props: {
    tknA: String,
    tknB: String,
    dexA: String,
    dexB: String
  }
};
</script>

<style lang="css" scoped></style>
