var txDefaultOrig =
{
  websites: {
    "wallet": "https://wallet.gnosis.pm",
    "gnosis": "https://gnosis.pm",
    "ethGasStation": "https://safe-relay.gnosis.pm/api/v1/gas-station/"
  },
  resources : {
    "termsOfUse": "https://wallet.gnosis.pm/TermsofUseMultisig.pdf",
    "privacyPolicy": "https://gnosis.io/privacy-policy",
    "imprint": "https://wallet.gnosis.pm/imprint.html"
  },
  gasLimit: 350000,
  gasPrice: 225 * 10e8,
  ethereumNode: "https://api.avax.network/ext/bc/C/rpc",
  connectionChecker: {
    method : "OPTIONS",
    url : "https://www.google.com",
    checkInterval: 5000
  },
  accountsChecker: {
    checkInterval: 5000
  },
  transactionChecker: {
    checkInterval: 15000
  },
  wallet: "injected",
  defaultChainID: null,
  walletFactoryAddress: "0xf30D72705962fF7b3722164AAA9776f6b7314387",
  tokens: [
    {
      'address': '0x60781C2586D68229fde47564546784ab3fACA982',
      'name': 'Pangolin',
      'symbol': 'PNG',
      'decimals': 18
    },
    {
      'address': '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15',
      'name': 'Ether',
      'symbol': 'ETH',
      'decimals': 6
    },
    {
      'address': '0x8DF92E9C0508aB0030d432DA9F2C65EB1Ee97620',
      'name': 'Maker',
      'symbol': 'MKR',
      'decimals': 18
    },
    {
      'address': '0xde3A24028580884448a5397872046a019649b084',
      'name': 'Tether USD',
      'symbol': 'USDT',
      'decimals': 18
    },
    {
      'address': '0xB3fe5374F67D7a22886A0eE082b2E2f9d2651651',
      'name': 'ChainLink Token',
      'symbol': 'LINK',
      'decimals': 18
    },
    {
      'address': '0x8cE2Dee54bB9921a2AE0A63dBb2DF8eD88B91dD9',
      'name': 'Aave Token',
      'symbol': 'AAVE',
      'decimals': 18
    },
    {
      'address': '0xf39f9671906d8630812f9d9863bBEf5D523c84Ab',
      'name': 'Uniswap',
      'symbol': 'UNI',
      'decimals': 18
    },
    {
      'address': '0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB',
      'name': 'Wrapped BTC',
      'symbol': 'WBTC',
      'decimals': 8
    },
    {
      'address': '0x53CEedB4f6f277edfDDEdB91373B044FE6AB5958',
      'name': 'Compound',
      'symbol': 'COMP',
      'decimals': 18
    },
    {
      'address': '0x421b2a69b886BA17a61C7dAd140B9070d5Ef300B',
      'name': 'HuobiToken',
      'symbol': 'HT',
      'decimals': 18
    },
    {
      'address': '0x39cf1BD5f15fb22eC3D9Ff86b0727aFc203427cc',
      'name': 'SushiToken',
      'symbol': 'SUSHI',
      'decimals': 18
    },
    {
      'address': '0xC84d7bfF2555955b44BDF6A307180810412D751B',
      'name': 'UMA Voting Token v1',
      'symbol': 'UMA',
      'decimals': 18
    },
    {
      'address': '0xaEb044650278731Ef3DC244692AB9F64C78FfaEA',
      'name': 'Binance USD',
      'symbol': 'BUSD',
      'decimals': 18
    },
    {
      'address': '0xBEB9eF514a379B997e0798FDcC901Ee474B6D9A1',
      'name': 'Melon',
      'symbol': 'MLN',
      'decimals': 18
    },
    {
      'address': '0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a',
      'name': 'Dai Stablecoin',
      'symbol': 'DAI',
      'decimals': 18
    },
    {
      'address': '0xC38f41A296A4493Ff429F1238e030924A1542e50',
      'name': 'Snowball',
      'symbol': 'SNOB',
      'decimals': 18
    },
    {
      'address': '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      'name': 'Wrapped AVAX',
      'symbol': 'WAVAX',
      'decimals': 18
    }
  ]
};

if (isElectron) {
  txDefaultOrig.wallet = "remotenode";
}

var txDefault = {
  ethereumNodes : [
    {
      url : "https://api.avax.network/ext/bc/C/rpc",
      name: "Remote Mainnet"
    },
    {
      url : "https://api.avax-test.network/ext/bc/C/rpc",
      name: "Remote Fuji"
    },
    {
      url : "http://localhost:8545",
      name: "Local node"
    }
  ],
  walletFactoryAddresses: {
    'mainnet': {
      name: 'Avalanche Mainnet',
      address: txDefaultOrig.walletFactoryAddress
    },
    'fuji': {
      name: 'Fuji Testnet',
      address: '0x93371Daa7d2E33A9C6cb29f47375AD4923F7e1DC'
    },
    'privatenet': {
      name: 'Privatenet',
      address: '0x93371Daa7d2E33A9C6cb29f47375AD4923F7e1DC'
    }
  }
};

var oldWalletFactoryAddresses = [
  ("0x12ff9a987c648c5608b2c2a76f58de74a3bf1987").toLowerCase(),
  ("0xed5a90efa30637606ddaf4f4b3d42bb49d79bd4e").toLowerCase(),
  ("0xa0dbdadcbcc540be9bf4e9a812035eb1289dad73").toLowerCase()
];

/**
* Update the default wallet factory address in local storage
*/
function checkWalletFactoryAddress() {
  var userConfig = JSON.parse(localStorage.getItem("userConfig"));

  if (userConfig && oldWalletFactoryAddresses.indexOf(userConfig.walletFactoryAddress.toLowerCase()) >= 0) {
    userConfig.walletFactoryAddress = txDefaultOrig.walletFactoryAddress;
    localStorage.setItem("userConfig", JSON.stringify(userConfig));
  }
}

/**
* Reload configuration
*/
function loadConfiguration () {
  var userConfig = JSON.parse(localStorage.getItem("userConfig"));
  Object.assign(txDefault, txDefaultOrig, userConfig);
}

checkWalletFactoryAddress();
loadConfiguration();
