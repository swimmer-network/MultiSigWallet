var txDefaultOrig =
{
  websites: {
    "wallet": "https://multisig.swimmer.network/",
    "gnosis": "https://gnosis.pm",
    "ethGasStation": "https://safe-relay.gnosis.pm/api/v1/gas-station/"
  },
  resources : {
    "termsOfUse": "https://wallet.gnosis.pm/TermsofUseMultisig.pdf",
    "privacyPolicy": "https://gnosis.io/privacy-policy",
    "imprint": "https://wallet.gnosis.pm/imprint.html"
  },
  gasLimit: 350000,
  gasPrice: 12000 * 10e8,
  ethereumNode: "https://avax-cra-rpc.gateway.pokt.network/",
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
  walletFactoryAddress: "0xf30D72705962fF7b3722164AAA9776f6b7314387", // need to change
  tokens: [
    {
      'address': '0x9c765eEE6Eff9CF1337A1846c0D93370785F6C92',
      'name': 'Wrapped TUS',
      'symbol': 'WTUS',
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
      url : "https://avax-cra-rpc.gateway.pokt.network/",
      name: "Remote Swimmer Mainnet"
    },
    {
      url : "https://vanilla-testnet-rpc.swimmer.network/ext/bc/qVd94hjZUfN5h5ZPxozos1wHjaszipeGJoYYxxMJ3dqZYFjZ3/rpc",
      name: "Remote Swimmer Vanilla Tesnet"
    },
    {
      url : "http://localhost:8545",
      name: "Local node"
    }
  ],
  walletFactoryAddresses: {
    'mainnet': {
      name: 'Swimmer Mainnet',
      address: txDefaultOrig.walletFactoryAddress
    },
    'testnet': {
      name: 'Swimmer Testnet',
      address: txDefaultOrig.walletFactoryAddress
    },
    'vanilla': {
      name: 'Vanilla Testnet',
      address: '0xf30D72705962fF7b3722164AAA9776f6b7314387'
    },
    'privatenet': {
      name: 'Privatenet',
      address: '0xf30D72705962fF7b3722164AAA9776f6b7314387'
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
