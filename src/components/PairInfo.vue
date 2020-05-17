<template lang="html">
  <div class="">
    <h4>{{ pair.tkn0.symbol }}:{{ pair.tkn1.symbol }}</h4>
    <h4>{{ pair.oneA2B }}, {{ pair.oneB2A }}</h4>
  </div>
</template>

<script>
import { reactive } from "@vue/composition-api";
import _state from "../store/state";

export default {
  name: "PairInfo",
  setup(addr) {
    const state = reactive(_state);
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
    const pairContract = new state.web3.eth.Contract(
      state.contracts.uniswapV2Pair.abi,
      addr.addr //The property with address of this Pair components contract
    );
    const routerContract = state.contracts.uniswapV2Router01.contract;

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
            pairContract.methods
              .getReserves()
              .call()
              .then(reserves => {
                // Then calls getAmountOut for 1 of tkn0 to tkn1 from the router contract
                pair.reserves = reserves;
                routerContract.methods
                  .getAmountOut(1, pair.reserves[0], pair.reserves[1])
                  .call()
                  .then(amountOut => {
                    pair.oneA2B = amountOut;
                  })
                  .catch(console.log);

                routerContract.methods
                  .getAmountOut(1, pair.reserves[1], pair.reserves[0])
                  .call()
                  .then(amountOut => {
                    pair.oneB2A = amountOut;
                  })
                  .catch(console.log);
              })
              .catch(console.log);
            // Now with the tkn1.address create a new contract instance
            const tkn1 = (pair.tkn1.contract = new state.web3.eth.Contract(
              state.contracts.ierc20.abi,
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
        const tkn0 = (pair.tkn0.contract = new state.web3.eth.Contract(
          state.contracts.ierc20.abi,
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

    return { state, pair };
  },
  props: {
    addr: String
  }
};
</script>

<style lang="css" scoped></style>
