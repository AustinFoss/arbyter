import state from "./state";
import Web3 from "web3";

export default {
  // Inits the Web3 instance
  // For now provider is set to metaMask
  // TODO: Have this function accept an argument allowing user to set provider
  initWeb3: function() {
    state.web3 = new Web3(window.ethereum);
  },
  // Sets the value for state.time
  keepTime: function() {
    state.time = Date.now();
  },
  // TODO: simplify to make reusable by checkBlock() below
  getBlock: function() {
    this.keepTime();
    state.web3.eth
      .getBlock("latest")
      .then(block => {
        this.keepTime();
        if (block.number > state.block.height) {
          state.block.height = block.number;
          state.block.epoch = Number(block.timestamp);

          // Update UniSwapV2 Pair Markets
          const routerContract = state.contracts.uniswapV2Router01.contract.get(
            state.contracts.uniswapV2Router01.address
          );
          state.contracts.uniswapV2Pair.address.forEach(value => {
            this.getPairMarket(routerContract, value);
          });

          this.getBlock();
        } else {
          this.getBlock();
        }
      })
      .catch(err => {
        if (err) {
          console.log("Error getting new block: " + err);
          this.getBlock();
        }
      });
  },
  // Inits a new web3.eth.Contract() providing an ABI object with matching addres string
  newContract: function(_abi: AbiItem, _address: string) {
    return new state.web3.eth.Contract(_abi, _address);
  },
  // Passes all supported token addresses from state.supportedTkns
  // Assignes the value of all state.possiblePairs[]
  matchMakePossiblePairs: function(startAt: number) {
    // matchPossiblePairs is a double recursive function
    // Iterating over state.supportedTkns[]
    // Matching all unique pairs
    const tkn0 = startAt;
    if (tkn0 < state.supportedTkns.length) {
      //  First init a new erc20 contract
      state.contracts.ierc20.contracts.set(
        state.supportedTkns[tkn0],
        this.newContract(state.contracts.ierc20.abi, state.supportedTkns[tkn0])
      );
      this.getSymbol(state.supportedTkns[tkn0]);
      const tkn1: number = tkn0 + 1;

      const make = function(tkn0: number, tkn1: number) {
        if (tkn1 < state.supportedTkns.length) {
          // Push the made match to possiblePairs[] if not already included
          const madeMatch = {
            tknA: state.supportedTkns[tkn0],
            tknB: state.supportedTkns[tkn1]
          };
          state.possiblePairs.push(madeMatch);

          // Move to the next possible pair
          make(tkn0, tkn1 + 1);
        } else {
          return;
        }
      };
      make(tkn0, tkn1);
      // Match the next iteration of token pairs
      this.matchMakePossiblePairs(tkn0 + 1);
    } else {
      return;
    }
  },
  // Pass ERC20 address string and returns symbol string
  getSymbol: function(addr: string) {
    state.contracts.ierc20.contracts
      .get(addr)
      .methods.symbol()
      .call()
      .then((res: string) => {
        state.symbols.set(addr, res);
      })
      .catch(console.log);
  },

  // Fetch all UniswapV2 PM's
  getPairMarket: function(routerContract, addr: string) {
    const dataHolder = {
      tknA: {
        address: String as string,
        contract: Object,
        symbol: String as string
      },
      tknB: {
        address: String as string,
        contract: Object,
        symbol: String as string
      },
      reserves: {},
      oneA2B: Number as number,
      oneB2A: Number as number
    };
    const pairContract = state.contracts.uniswapV2Pair.contracts.get(addr);
    pairContract.methods
      .token0()
      .call()
      .then((tkn: string) => {
        dataHolder.tknA.address = tkn;
        pairContract.methods
          .token1()
          .call()
          .then((tkn: string) => {
            dataHolder.tknB.address = tkn;
            pairContract.methods
              .getReserves()
              .call()
              .then(reserves => {
                // Then calls getAmountOut for 1 of tkn0 to tkn1 from the router contract
                dataHolder.reserves = reserves;
                routerContract.methods
                  .getAmountOut(
                    1,
                    dataHolder.reserves[0],
                    dataHolder.reserves[1]
                  )
                  .call()
                  .then((amountOut: number) => {
                    // 1tknA -> XtknB
                    dataHolder.oneA2B = amountOut;
                    routerContract.methods
                      .getAmountOut(
                        1,
                        dataHolder.reserves[1],
                        dataHolder.reserves[0]
                      )
                      .call()
                      .then((amountOut: number) => {
                        // 1tknB -> XtknA
                        dataHolder.oneB2A = amountOut;
                        state.pairMarkets.set(addr, null);
                        state.pairMarkets.set(addr, dataHolder);
                        // // Now catch if either is zero
                        // if (dataHolder.oneA2B == 0) {
                        //   dataHolder.oneA2B = 1 / dataHolder.oneB2A;
                        // } else if (dataHolder.oneB2A == 0) {
                        //   dataHolder.oneB2A = 1 / dataHolder.oneA2B;
                        // }
                        // // Math correction if USDC tkn is present in pair
                        // if (dataHolder.tknA.symbol == "USDC") {
                        //   dataHolder.oneB2A =
                        //     dataHolder.oneB2A * Math.pow(10, 12);
                        //   dataHolder.oneA2B =
                        //     dataHolder.oneA2B / Math.pow(10, 12);
                        // } else if (dataHolder.tknB.symbol == "USDC") {
                        //   dataHolder.oneA2B =
                        //     dataHolder.oneA2B * Math.pow(10, 12);
                        //   dataHolder.oneB2A =
                        //     dataHolder.oneB2A / Math.pow(10, 12);
                        // }
                      })
                      .catch(console.log);
                  })
                  .catch(console.log);
              })
              .catch(console.log);
            // Now with the tkn1.address create a new contract instance
            const tknB = (dataHolder.tknB.contract = this.newContract(
              state.contracts.ierc20.abi,
              dataHolder.tknB.address
            ));
            tknB.methods
              .symbol()
              .call()
              .then((symbol: string) => {
                dataHolder.tknB.symbol = symbol;
              })
              .catch(console.log);
          })
          .catch(console.log);
        // Now with the tkn0.address create a new contract instance
        const tknA = (dataHolder.tknA.contract = this.newContract(
          state.contracts.ierc20.abi,
          dataHolder.tknA.address
        ));
        tknA.methods
          .symbol()
          .call()
          .then((symbol: string) => {
            dataHolder.tknA.symbol = symbol;
          })
          .catch(console.log);
      })
      .catch(console.log);
  }
};
