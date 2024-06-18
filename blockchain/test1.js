//const { Crypto, Utils } = require("@archethicjs/sdk")
import Archethic, { Crypto, Utils } from "@archethicjs/sdk"

import { randomBytes } from "crypto"
import { requestFaucet } from "./faucet.js"
// content: Crypto.hash(contract.code)

 

const originPrivateKey = Utils.originPrivateKey
let archethic




function getCallTransaction(contractAddress, callerSeed, index) {


    console.log("Call by", callerSeed, index)
 

    return archethic.transaction.new()
        .setType("transfer")
        .setContent("ok")
        .addRecipient(contractAddress, "transfer" )
       // .addRecipient(contractAddress, "addCodes", [ "qqqqqqqqqqqqq",
       // "",
       // ""])
        .build(callerSeed, index )
        .originSign(originPrivateKey)
}

//

async function run() {
    return new Promise(async function (resolve, reject) {
        try {
            const endpoint = process.env["ENDPOINT"] || "https://testnet.archethic.net"

            archethic = new Archethic(endpoint)
            await archethic.connect()

            const contractSeed = "philippe.valette.contract.82" //randomBytes(32)
            const contractAddress = Crypto.deriveAddress(contractSeed)

            const callerSeed = "philippe.valette.poller.20"  //randomBytes(32)

            const callerAddress = Crypto.deriveAddress(callerSeed)

            console.log("contractSeed =", contractSeed)
            console.log("contractAddress =", Utils.uint8ArrayToHex(contractAddress))
            console.log("callerSeed =", callerSeed)
            console.log("callerAddress =", Utils.uint8ArrayToHex(callerAddress))

            const index = await archethic.transaction.getTransactionIndex(callerAddress);


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

            //generis  let contractAddress2 = Utils.hexToUint8Array("00006e26192986216ac67dd0d74aaeed19afea5b52a7c2e02183bc4913318cfd0cf3")
            //   let contractAddress2 = Utils.hexToUint8Array("00007ba82ca1bcf818e53ce9acdf987b0a14190b59ec268b5f3d581999bfd3887293")



            let contractAddress2 = Utils.hexToUint8Array("00007eac6ccbda8297dee3836643609d08f55812a5e62d92c2017e391bdad27e03c8")

            const callTx = getCallTransaction(contractAddress, callerSeed, index)
            const result = await archethic.transaction.getTransactionFee(callTx)

            console.log("Result", result)
            callTx
                .on("sent", () => {
                    console.debug("Contract's call transaction sent")
                    console.debug("Await validation ...")
                })
                .on("error", (context, reason) => {
                    console.log(context)
                    reject(`Contract's call transaction failed - ${reason}`)
                    return
                })
                .on("requiredConfirmation", async (confirmations, sender) => {
                    sender.unsubscribe()

                    console.debug(`Contract's call transaction created - ${Utils.uint8ArrayToHex(callTx.address)}`)

                    awaitTriggeredTransaction(archethic, contractAddress)
                        .then(() => {
                            resolve("Contract's call transaction executed with success")


                        })
                        .catch(reject)
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
    console.log(lastContent)
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