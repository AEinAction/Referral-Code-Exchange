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


            for (let i = 0; i < contractBalance.token.length; i++)
                {
                    console.log(contractBalance.token[i].address)
                    const token = await archethic.network.getToken(contractBalance.token[i].address);
                    console.log(token)
                }


           
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