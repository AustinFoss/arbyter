<template lang="html">
  <div class="">
    <h4>{{ addr }}</h4>
    <h4>{{ tkns.tkn0 }} / {{ tkns.tkn1 }}</h4>
  </div>
</template>

<script>
import { reactive } from "@vue/composition-api";
import _state from "../store/state";

export default {
  name: "PairInfo",
  setup(addr) {
    const state = reactive(_state);
    const tkns = reactive({
      tkn0: "",
      tkn1: ""
    });
    const pairCon = new state.web3.eth.Contract(
      state.contracts.uniswapV2Pair.abi,
      addr.addr
    );

    pairCon.methods
      .token0()
      .call()
      .then(tkn => {
        tkns.tkn0 = tkn;
      })
      .catch(console.log);
    pairCon.methods
      .token1()
      .call()
      .then(tkn => {
        console.log(tkn);
        tkns.tkn1 = tkn;
      })
      .catch(console.log);

    return { state, tkns };
  },
  props: {
    addr: String
  }
};
</script>

<style lang="css" scoped></style>
