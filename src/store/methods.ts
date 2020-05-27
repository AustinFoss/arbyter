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
          state.pairMarkets = [];
          state.block.height = block.number;
          state.block.epoch = Number(block.timestamp);

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
  matchMake: function(list): object[] {
    const matches: object[] = [];
    const match = function(list) {
      if (list.length > 0) {
        for (const i in list.slice(1)) {
          matches.push({ a: list[0], b: list.slice(1)[i] });
        }
        match(list.slice(1));
      }
    };
    match(list);
    return matches;
  },
  // Saves all unique combinations of supportedTkns
  matchMakePossiblePairs: function() {
    for (let match in this.matchMake(state.supportedTkns)) {
      match = this.matchMake(state.supportedTkns)[match];
      const madeMatch = {
        tknA: match.a,
        tknB: match.b,
        a2b: false
      };
      if (!state.possiblePairs.includes(madeMatch)) {
        state.possiblePairs.push(madeMatch);
      }
    }
  },
  // Saves all unique combinations of supportedDEXs
  matchMakeDexCombos: function() {
    for (let match in this.matchMake(state.supportedDEXs)) {
      match = this.matchMake(state.supportedDEXs)[match];
      const madeMatch = {
        dexA: match.a,
        dexB: match.b
      };
      if (!state.dexCombos.includes(madeMatch)) {
        state.dexCombos.push(madeMatch);
      }
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
  // Pass pairMarket's tknA, tknB, dex, & data
  saveData: function(tknA: string, tknB: string, dex: string, data: {}) {
    state.pairMarkets.push({ key: tknA + tknB + dex, data: data });
  }
};
