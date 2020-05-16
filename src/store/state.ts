import Web3 from "web3";

import * as uniswapV2Factory from "../build/contracts/UniswapV2Factory.json";
import * as uniswapV2Pair from "../build/contracts/UniswapV2Pair.json";
import * as erc20 from "../build/contracts/ERC20.json";

export default {
  web3: {} as Web3,
  contracts: {
    uniswapV2Factory: {
      name: uniswapV2Factory.contractName,
      abi: uniswapV2Factory.abi as AbiItem, // TODO assign propper type expectation
      address: ["0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"] as string[],
      contract: {}
    },
    uniswapV2Pair: {
      name: uniswapV2Pair.contractName,
      abi: uniswapV2Pair.abi as AbiItem, // TODO assign propper type expectation
      address: [] as string[]
    },
    erc20: {
      name: erc20.contractName,
      abi: erc20.abi as AbiItem
    }
  },
  pairs: new Map()
};
