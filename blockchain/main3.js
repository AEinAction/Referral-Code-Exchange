//const { Crypto, Utils } = require("@archethicjs/sdk")
import Archethic, { Crypto, Utils } from "@archethicjs/sdk"

import { randomBytes } from "crypto"
import { requestFaucet } from "./faucet.js"


const originPrivateKey = Utils.originPrivateKey
let archethic


function contractCode() {
    return `@version 1

            condition triggered_by: transaction, on: getOffChain(url), as: [ 
                    content: true
            ]
           actions triggered_by: transaction, on: getOffChain(url) do
                State.set("url",url) 
             end

             
export fun get_url() do
url = State.get("url") 
url
end
 
`
}

/*

export fun get_url() do
  url = State.get("url") 
  url
end
*/

async function getNFTTransaction(seed, index) {

    const secretKey = Crypto.randomSecretKey();
    const cipher = Crypto.aesEncrypt(seed, secretKey);

    const storageNoncePublicKey = await archethic.network.getStorageNoncePublicKey()

    const encryptedSecretKey = Crypto.ecEncrypt(secretKey, storageNoncePublicKey);
    const authorizedKeys = [
        {
            publicKey: storageNoncePublicKey,
            encryptedSecretKey: encryptedSecretKey,
        }
    ]
   
    return archethic.transaction.new()
        .setType("contract")
        .setCode(contractCode())
        .addOwnership(cipher, authorizedKeys)
        .build(seed, index)
        .originSign(originPrivateKey)
}

 
 

async function getContractTransaction(seed, index) {

    const secretKey = Crypto.randomSecretKey();
    const cipher = Crypto.aesEncrypt(seed, secretKey);

    const storageNoncePublicKey = await archethic.network.getStorageNoncePublicKey()

    const encryptedSecretKey = Crypto.ecEncrypt(secretKey, storageNoncePublicKey);
    const authorizedKeys = [
        {
            publicKey: storageNoncePublicKey,
            encryptedSecretKey: encryptedSecretKey,
        }
    ]
   
    return archethic.transaction.new()
        .setType("contract")
        .setCode(contractCode())
        .addOwnership(cipher, authorizedKeys)
        .build(seed, index)
        .originSign(originPrivateKey)
}

function getCallTransaction(contractAddress, callerSeed,index) {
    const hashCode = Utils.uint8ArrayToHex(Crypto.hash(contractCode()))

    return archethic.transaction.new()
        .setType("transfer")
       .setContent(hashCode.toUpperCase().slice(2))
       //.setContent("in")
        .addRecipient(contractAddress, "getOffChain", ["https://api.b4food.io/api/b4food/tablet/v2/pages/fake-order"])
        .build(callerSeed, index)
        .originSign(originPrivateKey)
}


function getCallTransaction2(contractAddress, pollerSeed) {
    const hashCode = Utils.uint8ArrayToHex(Crypto.hash(contractCode()))

    return archethic.transaction.new()
        .setType("transfer")
        .setContent(hashCode.toUpperCase().slice(2))
        .addRecipient(contractAddress, "transfer")
        .build(pollerSeed, 0)
        .originSign(originPrivateKey)
}

 
async function run() {
    return new Promise(async function (resolve, reject) {
        try {
            const endpoint = process.env["ENDPOINT"] || "https://testnet.archethic.net"

            archethic = new Archethic(endpoint)
            await archethic.connect()

            const contractSeed = "function.valette.contract.3" //randomBytes(32)
            const contractAddress = Crypto.deriveAddress(contractSeed)

            const callerSeed = "nft.valette.caller.0"  //randomBytes(32)
            const callerAddress = Crypto.deriveAddress(callerSeed)

          

            console.log("contractSeed =", contractSeed)
            console.log("contractAddress =", Utils.uint8ArrayToHex(contractAddress))



            console.log("callerSeed =", callerSeed)
            console.log("callerAddress =", Utils.uint8ArrayToHex(callerAddress))

      
            const index = await archethic.transaction.getTransactionIndex(callerAddress);
            const indexContract = await archethic.transaction.getTransactionIndex(contractAddress);
            //        console.debug("Request funds from faucet...")

            //      await requestFaucet(Utils.uint8ArrayToHex(contractAddress), endpoint)
            //     await requestFaucet(Utils.uint8ArrayToHex(callerAddress), endpoint)


            const contractBalance = await archethic.network.getBalance(contractAddress)
            console.log("contractBalance =", Utils.fromBigInt(contractBalance.uco), "UCO")
            if (Utils.fromBigInt(contractBalance.uco) < 10) {
                reject(`Invalid balance for the contract's address`)
                return
            }
            console.log(contractBalance)
            const callerBalance = await archethic.network.getBalance(callerAddress)

            console.log("callerBalance =", Utils.fromBigInt(callerBalance.uco), "UCO")
            if (Utils.fromBigInt(callerBalance.uco) < 10) {
                reject(`Invalid balance for the caller's address`)
                return
            }

 
             
             
       
            const contractTx = await getContractTransaction(contractSeed,indexContract)
            console.log(">>>>>>>Contract>>>>>>>>", Utils.uint8ArrayToHex(contractTx.address))
            contractTx
                .on("sent", () => {
                    console.debug("Contract transaction sent")
                    console.debug("Await validation ...")
                })
                .on("error", (context, reason) => {
                    reject(`Contract transaction failed - ${reason}`)
                    return
                })
                .on("requiredConfirmation", (confirmations, sender) => {
                    sender.unsubscribe()

                    console.debug(`Contract transaction created - ${Utils.uint8ArrayToHex(contractTx.address)}`)

                    const callTx = getCallTransaction(contractTx.address, callerSeed,index)

                    callTx
                        .on("sent", () => {
                            console.debug("Contract's call transaction sent")
                            console.debug("Await validation ...")
                        })
                        .on("error", (context, reason) => {
                            reject(`Contract's call transaction failed - ${reason}`)
                            return
                        })
                        .on("requiredConfirmation", async (confirmations, sender) => {
                            sender.unsubscribe()

                            console.debug(`Contract's call transaction created - ${Utils.uint8ArrayToHex(callTx.address)}`)

                            awaitTriggeredTransaction(archethic, contractTx.address)
                                .then(() => {
                                   // resolve("Contract's call transaction executed with success")
                                   console.log("Contract's call transaction executed with success")
                                

                                })
                                .catch(reject)
                        })
                        .send()
                })
                .send()
        } catch (e) {
            reject(e)
            return
        }
    })
}

async function awaitTriggeredTransaction(archethic, contractAddress, retries = 0) {
    await new Promise(r => setTimeout(r, 3000));
    const { lastTransaction: { data: { content: lastContent } } } = await archethic.network.rawGraphQLQuery(`query
        {
          lastTransaction(address: "${Utils.uint8ArrayToHex(contractAddress)}") {
            data {
                content
            }
          }
        }`)

    if (lastContent != "") {
        if (retries == 3) {
            throw "Contract self trigger transaction not executed"
        }
        else {
            console.info(`Retry attempt #${retries + 1}`)
            await awaitTriggeredTransaction(archethic, contractAddress, retries + 1)
        }
    }
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