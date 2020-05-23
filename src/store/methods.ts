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
          state.block.epoch = block.timestamp;
          this.getBlock();
        } else {
          this.getBlock();
        }
      })
      .catch(err => {
        if (err) {
          console.log("Error getting new block");
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
  matchMakePossiblePairs: function() {
    // matchPossiblePairs is a double recursive function
    // Iterating over state.supportedTkns[]
    // Matching all unique pairs
    const tkn0 = 0;
    const match = function(tkn0: number) {
      if (tkn0 < state.supportedTkns.length) {
        const tkn1: number = tkn0 + 1;

        const make = function(tkn0: number, tkn1: number) {
          if (tkn1 < state.supportedTkns.length) {
            // Make the match by pushing the pair to possiblePairs[]
            state.possiblePairs.push({
              tkn0: state.supportedTkns[tkn0],
              tkn1: state.supportedTkns[tkn1]
            });
            // Move to the next possible pair
            make(tkn0, tkn1 + 1);
          } else {
            return;
          }
        };
        make(tkn0, tkn1);
        // Match the next iteration of token pairs
        match(tkn0 + 1);
      } else {
        console.log(state.possiblePairs);
        return;
      }
    };
    match(tkn0);
  },
  // Assign all pair contracts
  getUniswapV2Pairs: function() {
    //For each possible pair in state.possiblePairs
    const pair = 0;
    const getPair = function(pair: number) {
      if (pair < state.possiblePairs.length) {
        state.contracts.uniswapV2Factory.contract.methods
          .getPair(
            state.possiblePairs[pair].tkn0,
            state.possiblePairs[pair].tkn1
          )
          .call()
          .then((address: string) => {
            // If returned contract address is new save it to state
            if (
              state.contracts.uniswapV2Pair.address.includes(address) == false
            ) {
              state.contracts.uniswapV2Pair.address.push(address);
              getPair(pair + 1);
            }
          })
          .catch(console.log);
      } else {
        return;
      }
    };
    getPair(pair);
  },
  // Called at the start of the app to load in all dex market contract, or other, instances
  loadDexMarkets: function() {
    this.getUniswapV2Pairs();
  },
  // Fetch all UniswapV2 PM's
  //  dasdfasdf
  getPairMarket: function(routerContract, pairContract, pair) {
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
            // 1tknA -> XtknB
            pair.oneA2B = amountOut;
            routerContract.methods
              .getAmountOut(1, pair.reserves[1], pair.reserves[0])
              .call()
              .then(amountOut => {
                // 1tknB -> XtknA
                pair.oneB2A = amountOut;

                // Now catch if either is zero
                if (pair.oneA2B == 0) {
                  pair.oneA2B = 1 / pair.oneB2A;
                } else if (pair.oneB2A == 0) {
                  pair.oneB2A = 1 / pair.oneA2B;
                }
                // Math correction if USDC tkn is present in pair
                if (pair.tkn0.symbol == "USDC") {
                  pair.oneB2A = pair.oneB2A * Math.pow(10, 12);
                  pair.oneA2B = pair.oneA2B / Math.pow(10, 12);
                } else if (pair.tkn1.symbol == "USDC") {
                  pair.oneA2B = pair.oneA2B * Math.pow(10, 12);
                  pair.oneB2A = pair.oneB2A / Math.pow(10, 12);
                }
              })
              .catch(console.log);
          })
          .catch(console.log);
      })
      .catch(console.log);
  }
};
