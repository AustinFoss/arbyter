import Web3 from "web3";

import * as uniswapV2Factory from "../contractABIs/UniswapV2Factory.json";
import * as uniswapV2Pair from "../contractABIs/UniswapV2Pair.json";
import * as uniswapV2Router01 from "../contractABIs/UniswapV2Router01.json";
import * as ierc20 from "../contractABIs/IERC20.json";
import * as kyberNetworkProxy from "../contractABIs/KyberNetworkProxy.json";

export default {
  // TODO: Ask to user to assign their own provider
  // Gives a list of a set list of supported providers
  // providers: {
  //   metaMask: window.ethereum
  // },
  // Common Web3 instance for the App
  web3: {} as Web3,
  // Time in unix epoch
  time: 0,
  // Current block height and timestamp
  block: {
    height: 0,
    epoch: 0
  },
  // List of supported ERC20 tokens
  // TODO: Future feature to allow a user to select from a list
  supportedTkns: [
    // WETH
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    // DAI
    "0x6b175474e89094c44da98b954eedeac495271d0f",
    // USDC
    // "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    // Tether
    // "0xdac17f958d2ee523a2206206994597c13d831ec7",
    // OMG
    // "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07",
    // BAT
    "0x0d8775f648430679a709e98d2b0cb6250d2887ef"
  ],
  symbols: new Map(),
  supportedDEXs: [
    "UniSwap",
    "Kyber"
    // "Oasis"
  ],
  dexCombos: [] as { dexA: string; dexB: string }[],
  // All possible pairs, no duplicates, from supportedTkns
  possiblePairs: [] as { tknA: string; tknB: string }[],
  // All necessary Web3 Contracts the app interacts with
  contracts: {
    uniswapV2Factory: {
      name: uniswapV2Factory.contractName,
      abi: uniswapV2Factory.abi as AbiItem, // TODO assign propper type expectation
      address: ["0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"] as string[],
      contract: new Map()
    },
    uniswapV2Router01: {
      name: uniswapV2Router01.contractName,
      abi: uniswapV2Router01.abi as AbiItem,
      address: ["0xf164fC0Ec4E93095b804a4795bBe1e041497b92a"] as string[],
      contract: new Map()
    },
    uniswapV2Pair: {
      name: uniswapV2Pair.contractName,
      abi: uniswapV2Pair.abi as AbiItem, // TODO assign propper type expectation
      address: new Map(),
      contracts: new Map()
    },
    ierc20: {
      name: ierc20.contractName,
      abi: ierc20.abi as AbiItem, // TODO assign propper type expectation
      address: [] as string[],
      contracts: new Map()
    },
    kyberNetworkProxy: {
      abi: kyberNetworkProxy.abi as AbiItem, // TODO assign propper type expectation
      address: ["0x818e6fecd516ecc3849daf6845e3ec868087b755"] as string[],
      contract: new Map()
    }
  },
  // All relevent Pair-Market data mapped to the PMs contract address
  pairMarkets: []
};
