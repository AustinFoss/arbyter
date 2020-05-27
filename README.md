# arbyter

For this repo to compile please make sure you have the latest release of VueJS 2 installed as well as yarn
This project was built on the Beta Build of the Vue3 composition API & Type Script

No remote API access is used and 100% of all data collected is from an Ethereum Provider

Metamask is required and is the only supported provider while under development.

The final form of this project is intended to have a local geth or openEth client as Metamask sometimes will skip blocks for up to a minute or more and for optimal performance you should have a block by block feed.

This works out of the box with the latest versions of Firefox and Brave Browsers.

Current DEXs that have been integrated are UniSwapV2 and Kyber Network.

Any ERC20 token can be added to

```
(/src/store/state.ts).supportedTkns
```

Ultimately what this project achieves is the ability to dynamically add ERC20 tokens, and see a dynamically generated price feed of all possible PairMarkets with the integrated DEXs. From there it further generates the percent difference between all different DEX combinations per PairMarket.

Further work to be done is to adjust for things like different decimal places between ERC20 tokens, DEXs returning TknA/B address assignments in the reverse of how they were passed, integration of Oasis DEX, and clean up some Web3 specific TypeErrors as

```
yarn build
```

will not work until type errors are fixed.

Once the above is complete, logic can be inserted at line 34 of

```
/src/components/PercentGain.vue
```

for the execution of a flash swap transaction to carry out the arbitration and possibly combine multiple swap hops together for an even more profitable trade.

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
