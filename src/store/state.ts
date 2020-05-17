import Web3 from "web3";

import * as uniswapV2Factory from "../rootContracts/uniswap-v2-core/build/contracts/UniswapV2Factory.json";
import * as uniswapV2Pair from "../rootContracts/uniswap-v2-core/build/contracts/UniswapV2Pair.json";
import * as uniswapV2Router01 from "../rootContracts/uniswap-v2-periphery/build/contracts/UniswapV2Router01.json";
import * as ierc20 from "../rootContracts/uniswap-v2-periphery/build/contracts/IERC20.json";

export default {
  web3: {} as Web3,
  contracts: {
    uniswapV2Factory: {
      name: uniswapV2Factory.contractName,
      abi: uniswapV2Factory.abi as AbiItem, // TODO assign propper type expectation
      address: ["0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"] as string[],
      contract: {}
    },
    uniswapV2Router01: {
      name: uniswapV2Router01.contractName,
      abi: uniswapV2Router01.abi as AbiItem,
      address: ["0xf164fC0Ec4E93095b804a4795bBe1e041497b92a"] as string[],
      contract: {}
    },
    uniswapV2Pair: {
      name: uniswapV2Pair.contractName,
      abi: uniswapV2Pair.abi as AbiItem, // TODO assign propper type expectation
      address: [] as string[]
    },
    ierc20: {
      name: ierc20.contractName,
      abi: ierc20.abi as AbiItem, // TODO assign propper type expectation
      address: [] as string[]
    }
  }
};
