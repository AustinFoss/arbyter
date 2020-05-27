<template lang="html">
  <div>
    <h4>
      Difference of
      {{ Math.abs((pm.a.oneB2A / (pm.b.oneA2B / 10 ** 18)) * 100 - 100) }}%
    </h4>
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
        // TODO: Insert logic here for recognizing ARB Opps
        // Chain other recognized ARB Opps from the other PercentGain components together
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
