(
  function () {
    angular
      .module('multiSigWeb')
      .service('Transaction', function (Web3Service, Wallet, $rootScope, $q) {
        var factory = {
          requiredReceipt: {},
          requiredInfo: {},
          updates: 0,
          callbacks: {}
        };

        function processReceipt(e, receipt) {
          if (!e && receipt) {
            receipt = Web3Service.toChecksumAddress(receipt);
            receipt.decodedLogs = Wallet.decodeLogs(receipt.logs);
            factory.update(receipt.transactionHash, {receipt: receipt});

            // call callback if it has
            if (factory.callbacks[receipt.transactionHash]) {
              // Execute callback function
              factory.callbacks[receipt.transactionHash](receipt);
            }
          }
        }

        function getTransactionInfo(e, info) {
          if (!e && info) {
            // Convert info object to an object containing checksum addresses
            info = Web3Service.toChecksumAddress(info);
            factory.update(info.hash, {info: info});
          }
        }

        factory.get = function () {
          return JSON.parse(localStorage.getItem("transactions")) || {};
        };

        /**
         * Add transaction object to the transactions collection
         */
        factory.add = function (tx) {
          // Convert incoming object's addresses to checksummed ones
          tx = Web3Service.toChecksumAddress(tx);

          var transactions = factory.get();
          transactions[tx.txHash] = tx;
          if (tx.callback) {
            factory.callbacks[tx.txHash] = tx.callback;
          }
          tx.date = new Date();
          localStorage.setItem("transactions", JSON.stringify(transactions));
          factory.updates++;
          try {
            $rootScope.$digest();
          } catch (e) {
          }

          Web3Service.web3.eth.getTransaction(
            tx.txHash,
            getTransactionInfo
          );
        };

        factory.update = function (txHash, newObj) {
          var transactions = factory.get();
          // Convert incoming object's addresses to checksummed ones
          newObj = Web3Service.toChecksumAddress(newObj);
          txHash = Web3Service.toChecksumAddress(txHash);
          Object.assign(transactions[txHash], newObj);
          localStorage.setItem("transactions", JSON.stringify(transactions));
          factory.updates++;
          try {
            $rootScope.$digest();
          } catch (e) {
          }
        };

        factory.notifyObservers = function () {
          factory.updates++;
        };

        /**
         * Remove transaction identified by transaction hash from the transactions collection
         */
        factory.remove = function (txHash) {
          var transactions = factory.get();
          delete transactions[txHash];
          localStorage.setItem("transactions", JSON.stringify(transactions));
          factory.updates++;
          try {
            $rootScope.$digest();
          } catch (e) {
          }
        };

        /**
         * Remove all transactions
         */
        factory.removeAll = function () {
          localStorage.removeItem("transactions");
          factory.updates++;
          try {
            $rootScope.$digest();
          } catch (e) {
          }
        };

        /**
         * Send transaction, signed by wallet service provider
         */
        factory.send = function (tx, cb) {
          Web3Service.sendTransaction(
            Web3Service.web3.eth,
            [
              tx
            ],
            {onlySimulate: false},
            function (e, txHash) {
              if (e) {
                cb(e);
              } else {
                factory.add(
                  {
                    txHash: txHash,
                    callback: function (receipt) {
                      cb(null, receipt);
                    }
                  }
                );
                cb(null, txHash);
              }
            }
          );
        };

        factory.simulate = function (tx, cb) {
          var options = Object.assign({onlySimulate: true}, tx);

          Web3Service.sendTransaction(
            Web3Service.web3.eth,
            [
              tx
            ],
            options,
            function (e, txHash) {
              if (e) {
                cb(e);
              } else {
                cb(null, txHash);
              }
            }
          );
        };

        /**
         * Sign transaction without sending it to an ethereum node
         */
        factory.signOffline = function (txObject, cb) {
          Wallet.getUserNonce(function (e, nonce) {
            if (e) {
              cb(e);
            } else {
              // Create transaction object
              var txInfo = {
                from: Web3Service.coinbase,
                to: txObject.to,
                value: txObject.value,
                gasPrice: ethereumjs.Util.intToHex(Wallet.txParams.gasPrice),
                gas: ethereumjs.Util.intToHex(Wallet.txParams.gasLimit),
                nonce: ethereumjs.Util.intToHex(nonce)
              };

              Web3Service.web3.eth.signTransaction(txInfo, function (e, signed) {
                if (e) {
                  cb(e);
                } else {
                  cb(e, signed.raw);
                }
              });
            }
          });
        };

        /**
         * Sign transaction without sending it to an ethereum node. Needs abi,
         * selected method to execute and related params.
         */
        factory.signMethodOffline = function (tx, abi, method, params, cb) {

          // Get data
          var instance = Web3Service.web3.eth.contract(abi).at(tx.to);

          tx.data = instance[method].getData.apply(this, params);

          factory.signOffline(tx, cb);
        };

        /**
         * Send transaction, signed by wallet service provider. Needs abi,
         * selected method to execute and related params.
         */
        factory.sendMethod = function (tx, abi, method, params, cb) {
          // Instance contract
          var instance = Web3Service.web3.eth.contract(abi).at(tx.to);
          var transactionParams = params.slice();
          transactionParams.push(tx);

          try {
            Web3Service.sendTransaction(
              instance[method],
              transactionParams,
              {onlySimulate: false},
              function (e, txHash) {
                if (e) {
                  cb(e);
                } else {
                  // Add transaction
                  factory.add(
                    {
                      txHash: txHash,
                      callback: function (receipt) {
                        cb(null, receipt);
                      }
                    }
                  );
                  cb(null, txHash);
                }
              });
          } catch (e) {
            cb(e);
          }
        };

        factory.simulateMethod = function (tx, abi, method, params, cb) {
          // Instance contract
          var instance = Web3Service.web3.eth.contract(abi).at(tx.to);
          var options = Object.assign({onlySimulate: true}, tx);

          try {
            Web3Service.sendTransaction(
              instance[method],
              params,
              options,
              function (e, txHash) {
                if (e) {
                  cb(e);
                } else {
                  cb(null, txHash);
                }
              });
          } catch (e) {
            cb(e);
          }
        };

        /**
         * Send signed transaction
         **/
        factory.sendRawTransaction = function (tx, cb) {
          Web3Service.web3.eth.sendRawTransaction(
            tx,
            cb
          );
        };

        /**
         * Internal loop, checking for transaction receipts and transaction info.
         * calls callback after receipt is retrieved.
         */
        factory.checkReceipts = function () {
          // Create batch object
          var batch = Web3Service.web3.createBatch();

          // Add transactions without receipt to batch request
          var transactions = factory.get();
          var txHashes = Object.keys(transactions);

          for (var i = 0; i < txHashes.length; i++) {
            var tx = transactions[txHashes[i]];
            // Get transaction receipt
            if (tx && !tx.receipt) {
              batch.add(
                Web3Service.web3.eth.getTransactionReceipt.request(txHashes[i], processReceipt)
              );
            }
            // Get transaction info
            if (tx && !tx.info) {
              batch.add(
                Web3Service.web3.eth.getTransaction.request(
                  txHashes[i],
                  getTransactionInfo
                )
              );
            }
          }

          batch.execute();
        };

        factory.getEthereumChain = function () {
          return $q(function (resolve, reject) {
            Web3Service.web3.eth.getChainId(function (e, chainId) {
              var data = {};

              if (e) {
                reject();
              } else if (chainId == 73771) {
                data.chain = "Swimmer testnet";
                data.etherscan = "https://cchain.explorer.avax-test.network";
                data.walletFactoryAddress = txDefault.walletFactoryAddresses["testnet"].address;

              } else if (chainId == 73772) {
                data.chain = "Swimmer mainnet";
                data.etherscan = "https://avax-cra-rpc.gateway.pokt.network/";
                data.walletFactoryAddress = txDefault.walletFactoryAddresses["mainnet"].address;

              
              } else if (chainId == 73773) {
                data.chain = "Swimmer Vanilla Testnet";
                data.etherscan = "https://vanilla-testnet-rpc.swimmer.network/ext/bc/qVd94hjZUfN5h5ZPxozos1wHjaszipeGJoYYxxMJ3dqZYFjZ3/rpc";
                data.walletFactoryAddress = txDefault.walletFactoryAddresses["vanilla"].address;

              } else {
                data.chain = "privatenet";
                data.etherscan = "https://cchain.explorer.avax-test.network";
                data.walletFactoryAddress = txDefault.walletFactoryAddresses["privatenet"].address;
              }
              resolve(data);
            });
          });
        };

        return factory;
      });
  }
)();
