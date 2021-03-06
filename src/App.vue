<template>
  <div id="app">
    <h1>Arbyter</h1>
    <h3>Unix Epoch: {{ Math.round(vueState.time / 1000) }}</h3>
    <h3>
      Last Block #{{ vueState.block.height }}:
      {{ Math.round((vueState.time - vueState.block.epoch * 1000) / 1000) }}
      seconds ago
    </h3>

    <table>
      <thead>
        <tr>
          <td></td>
          <div
            class="subTable"
            v-for="dex in vueState.supportedDEXs"
            :key="dex"
          >
            <th :key="dex">{{ dex }}</th>
          </div>
        </tr>
      </thead>

      <tbody
        v-for="pair in vueState.possiblePairs"
        :key="vueState.possiblePairs[pair]"
      >
        <tr v-bind:key="vueState.possiblePairs[pair]">
          <td>
            <button v-if="pair.a2b == true" @click="pair.a2b = false">
              {{ vueState.symbols.get(pair.tknA) }}/{{
                vueState.symbols.get(pair.tknB)
              }}
            </button>
            <button v-else @click="pair.a2b = true">
              {{ vueState.symbols.get(pair.tknB) }}/{{
                vueState.symbols.get(pair.tknA)
              }}
            </button>
          </td>
          <div
            class="subTable"
            v-for="dex in vueState.supportedDEXs"
            :key="dex"
          >
            <td :key="dex" v-if="dex == 'UniSwap'">
              <p
                v-if="
                  vueState.contracts.uniswapV2Pair.contracts.get(
                    vueState.contracts.uniswapV2Pair.address.get(
                      pair.tknA + pair.tknB
                    )
                  ) == undefined
                "
              >
                Loading
              </p>
              <UniSwapPM
                v-else
                :tknA="pair.tknA"
                :tknB="pair.tknB"
                :possiblePairsIndex="vueState.possiblePairs.indexOf(pair)"
                :dex="dex"
              />
            </td>

            <td :key="dex" v-else-if="dex == 'Kyber'">
              <KyberPM
                :tknA="pair.tknA"
                :tknB="pair.tknB"
                :possiblePairsIndex="vueState.possiblePairs.indexOf(pair)"
                :dex="dex"
              />
            </td>
            <td :key="dex" v-else>WIP</td>
          </div>
          <div
            class="subTable"
            v-for="combo in vueState.dexCombos"
            :key="vueState.dexCombos[combo]"
          >
            <td :key="vueState.dexCombos[combo]">
              <PercentGain
                :tknA="pair.tknA"
                :tknB="pair.tknB"
                :dexA="combo.dexA"
                :dexB="combo.dexB"
              />
            </td>
          </div>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { onMounted } from "@vue/composition-api";
import { reactive } from "@vue/composition-api";
import UniSwapPM from "./components/UniSwapPM.vue";
import KyberPM from "./components/KyberPM.vue";
import PercentGain from "./components/PercentGain.vue";
import state from "./store/state";
import methods from "./store/methods";

export default Vue.extend({
  name: "App",
  components: { UniSwapPM, KyberPM, PercentGain },
  setup() {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Establish the sharedState as a reactive(state) for the Vue DApp
    const vueState = reactive(state);
    const vueMethods = methods;
    // Establish a new Ethereum connection a web3 instance in the sharedState
    vueMethods.initWeb3(); // TODO `.ethereum` throws TypErr
    // Instantiate the uniswapV2 webs.eth.Contracts
    vueState.contracts.uniswapV2Factory.contract.set(
      vueState.contracts.uniswapV2Factory.address,
      vueMethods.newContract(
        vueState.contracts.uniswapV2Factory.abi,
        vueState.contracts.uniswapV2Factory.address[0]
      )
    );
    vueState.contracts.uniswapV2Router01.contract.set(
      vueState.contracts.uniswapV2Router01.address,
      vueMethods.newContract(
        vueState.contracts.uniswapV2Router01.abi,
        vueState.contracts.uniswapV2Router01.address[0]
      )
    );
    vueState.contracts.kyberNetworkProxy.contract.set(
      vueState.contracts.kyberNetworkProxy.address,
      vueMethods.newContract(
        vueState.contracts.kyberNetworkProxy.abi,
        vueState.contracts.kyberNetworkProxy.address[0]
      )
    );
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // Init ERC20 contracts of all supportedTkns
    // & get their symbols
    for (let tkn in vueState.supportedTkns) {
      tkn = vueState.supportedTkns[tkn];
      vueState.contracts.ierc20.contracts.set(
        tkn,
        vueMethods.newContract(vueState.contracts.ierc20.abi, tkn)
      );

      vueMethods.getSymbol(tkn);
    }
    // Instantiate all Pair Markets
    vueMethods.matchMakePossiblePairs();
    for (const pair in vueState.possiblePairs) {
      const tknA = vueState.possiblePairs[pair].tknA;
      const tknB = vueState.possiblePairs[pair].tknB;
      // UniSwapV2
      vueState.contracts.uniswapV2Factory.contract
        .get(state.contracts.uniswapV2Factory.address)
        .methods.getPair(tknA, tknB)
        .call()
        .then((addr: string) => {
          // Save addr to the pool of UniSwap Pair Market Contract addresses
          vueState.contracts.uniswapV2Pair.address.set(tknA + tknB, addr);
          // Init the Pair Market Contract
          vueState.contracts.uniswapV2Pair.contracts.set(
            addr,
            vueMethods.newContract(vueState.contracts.uniswapV2Pair.abi, addr)
          );
        })
        .catch(console.log);
    }
    vueMethods.matchMakeDexCombos();

    onMounted(() => {
      // Start a recursive process that is constantly checking for a new Block
      vueMethods.getBlock();
    });

    return { vueState };
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
/* table {

} */
div.subTable {
  display: inline-table;
}

td {
  text-align: right;
  padding-right: 20px;
}
</style>
