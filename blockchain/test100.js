//const { Crypto, Utils } = require("@archethicjs/sdk")
import Archethic, { Crypto, Utils } from "@archethicjs/sdk"

const originPrivateKey = Utils.originPrivateKey
let archethic


function getCallTransaction(contractAddress, callerSeed, index) {
    console.log("Call by", callerSeed, index)
    console.log("Recipient",  Utils.uint8ArrayToHex(contractAddress))
    return archethic.transaction.new()
        .setType("transfer")
        .setContent("ok")
         .addRecipient(contractAddress, "add_type", [ "monerium" ])
        .build(callerSeed, index )
        .originSign(originPrivateKey)
}

function getCallTransaction2(contractAddress, callerSeed, index) {
    console.log("Call by", callerSeed, index)
  //  console.log("Recipient",  Utils.uint8ArrayToHex(contractAddress))
    return archethic.transaction.new()
        .setType("data")
        .setContent("ok")
        // .addRecipient(contractAddress, "add_type", [ "qqqqqqqqqqqqq" ])
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
            const contractSeed = "demo.charlie.11"
            const contractAddress = Crypto.deriveAddress(contractSeed)

      
            console.log("contractSeed =", contractSeed)
            console.log("contractAddress =", Utils.uint8ArrayToHex(contractAddress))
 


            const managerSeed = "demo.charlie.mgnt.01"
            const  managerAddress = Crypto.deriveAddress( managerSeed)

            const index = await archethic.transaction.getTransactionIndex(managerAddress);

            console.log("managerSeed =", managerSeed)
            console.log("managerAddress =", Utils.uint8ArrayToHex(managerAddress))
            console.log("index =", index)
 

            const managerBalance = await archethic.network.getBalance(managerAddress)
            console.log("managerBalance =", Utils.fromBigInt(managerBalance.uco), "UCO")




            if (Utils.fromBigInt((managerBalance.uco) < 10)) {
                reject(`Invalid balance for the contract's address`)
                return
            }
            console.log(managerBalance)
        
  
            const callTx = getCallTransaction(contractAddress, managerSeed, index)
            const result = await archethic.transaction.getTransactionFee(callTx)

            console.log("Result", result)
            callTx
                .on("sent", () => {
                    console.debug("Contract's call transaction sent")
                    console.debug("Await validation ...")
                })
                .on("error", (context, reason) => {
                    console.log(context)
                    reject(`call transaction failed - ${reason}`)
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