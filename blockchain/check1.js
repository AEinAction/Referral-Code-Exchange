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

            let contractAddress = Utils.hexToUint8Array("0000faa6d647a12100d29305d33a32f2cde964d2f77a54fd3ed98b303a4277b689c3")


 




            const contractBalance = await archethic.network.getBalance(contractAddress)
            console.log("contractBalance =", Utils.fromBigInt(contractBalance.uco), "UCO")
            if (Utils.fromBigInt(contractBalance.uco) < 10) {
                reject(`Invalid balance for the contract's address`)
                return
            }
            console.log(contractBalance)







            for (let i = 0; i < contractBalance.token.length; i++)
                {
                  // console.log(contractBalance.token[i].address)
                    const token = await archethic.network.getToken(contractBalance.token[i].address);
                    console.log(token)
                }
               // const token = await archethic.network.getToken("0000AF8810359AF00134E77B868B5707E666AACFC7824CA25EA19751A31118135046");
               // console.log(token)
                
           
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