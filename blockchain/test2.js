//const { Crypto, Utils } = require("@archethicjs/sdk")
import Archethic, { Crypto, Utils } from "@archethicjs/sdk"

import { randomBytes } from "crypto"
import { requestFaucet } from "./faucet.js"
// content: Crypto.hash(contract.code)

 

const originPrivateKey = Utils.originPrivateKey
let archethic

 


async function run() {
    return new Promise(async function (resolve, reject) {
        try {
            const endpoint = process.env["ENDPOINT"] || "https://testnet.archethic.net"

            archethic = new Archethic(endpoint)
            await archethic.connect()

            let contractAddress = Utils.hexToUint8Array("000078796A5062B350A8B8001D914CA75A877AEC8114894AA510EF53317C8DED42AF")

            const contractBalance = await archethic.network.getBalance(contractAddress)
            console.log("contractBalance =", Utils.fromBigInt(contractBalance.uco), "UCO")
            if (Utils.fromBigInt(contractBalance.uco) < 10) {
                reject(`Invalid balance for the contract's address`)
                return
            }
            console.log(contractBalance)

/*
            for (let i = 0; i < contractBalance.token.length; i++)
                {
                    console.log(contractBalance.token[i].address)
                    const token = await archethic.network.getToken(contractBalance.token[i].address);
                    console.log(token)
                }
*/


                let keychain = archethic.Keychain(
                    seed: archethic.hexToUint8List(
                      '7CAC8029F526FD4E4856E00161882F9F9F6B81B7C9221BB8529690FDCB642F03',
                    ),
                  ).copyWithService('uco', "m/650'/0/0");
          
                  archethic.account
                  .newKeychainTransaction(keychain, 0)
                  .originSign(originPrivateKey)
                  .on("confirmation", (confirmations, maxConfirmations, sender) => {
                    document.querySelector("#keychainSeed1").innerText = Utils.uint8ArrayToHex(keychain.seed);
                    let txEndpointLink = endpoint + "/explorer/transaction/" + Utils.uint8ArrayToHex(keychainAddress);
                    document.querySelector("#keychainTxLink").innerText = txEndpointLink;
                    document.querySelector("#keychainTxLink").setAttribute("href", txEndpointLink);
              
                    sender.unsubscribe();
              
                    archethic.account
                      .newAccessTransaction(accessSeed, keychainAddress)
                      .originSign(originPrivateKey)
                      .on("confirmation", (confirmation, maxConfirmation, sender) => {
                        let txEndpointLink = endpoint + "/explorer/transaction/" + Utils.uint8ArrayToHex(accessAddress);
                        document.querySelector("#accessKeychainTxLink").innerText = txEndpointLink;
                        document.querySelector("#accessKeychainTxLink").setAttribute("href", txEndpointLink);
                        document.querySelector("#keychainCreation").style.display = "block";
              
                        sender.unsubscribe();
                      })
                      .send();
                  })
                  .send();

           
        } catch (e) {
            reject(e)
            return
        }
    })
}

 

run()
    .then((msg) => {
        console.info(msg)
        return 0
    })
    .catch((msg) => {
        console.error(msg)
        return 1
    })
    .then(console.exit_when_flush)