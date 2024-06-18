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

            const contractSeed = "demo.charlie.10"
            const contractAddress = Crypto.deriveAddress(contractSeed)

      

            console.log("contractSeed =", contractSeed)
            console.log("contractAddress =", Utils.uint8ArrayToHex(contractAddress))
    
           

            //generis  let contractAddress2 = Utils.hexToUint8Array("00006e26192986216ac67dd0d74aaeed19afea5b52a7c2e02183bc4913318cfd0cf3")
            //   let contractAddress2 = Utils.hexToUint8Array("00007ba82ca1bcf818e53ce9acdf987b0a14190b59ec268b5f3d581999bfd3887293")
            const response = await archethic.network.callFunction(Utils.uint8ArrayToHex(contractAddress), "function_name" );
            console.log(response);

 
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