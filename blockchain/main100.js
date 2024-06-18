//const { Crypto, Utils } = require("@archethicjs/sdk")
import Archethic, { Crypto, Utils } from "@archethicjs/sdk"
import Handlebars from "handlebars"
import fs from "fs"

 

const CONTRACT_PATH = "./contracts/referral-code-type.exs"


const originPrivateKey = Utils.originPrivateKey
let archethic
 
function contractCode(context) {
    try {
        let content = fs.readFileSync(CONTRACT_PATH, "utf-8")
        var template = Handlebars.compile(content);
 
  
        return  template(context) ;
    }
    catch (e) {
        console.log(e)
        console.log(`Error ${CONTRACT_PATH} file not found\n`)
    }
    return null
}


async function buildContractTransaction(context) {

    const secretKey = Crypto.randomSecretKey();
    const cipher = Crypto.aesEncrypt(context.seed, secretKey);

    const storageNoncePublicKey = await archethic.network.getStorageNoncePublicKey()

    const encryptedSecretKey = Crypto.ecEncrypt(secretKey, storageNoncePublicKey);

    const authorizedKeys = [
        {
            publicKey: storageNoncePublicKey,
            encryptedSecretKey: encryptedSecretKey,
        }
    ]

    let code = contractCode(context);
    console.log(code)
    //Error when reading the contract code
    if (code == null) {
        return null;
    }

    return archethic.transaction.new()
        .setType("contract")
        .setCode(code)
        .addOwnership(cipher, authorizedKeys)
        .build(context.seed, context.index)
        .originSign(originPrivateKey)
}


async function run() {
    return new Promise(async function (resolve, reject) {
        try {
            const endpoint = process.env["ENDPOINT"] || "https://testnet.archethic.net"

            archethic = new Archethic(endpoint)
            await archethic.connect()

            const contractSeed = "demo.charlie.11"
            const contractAddress = Crypto.deriveAddress(contractSeed)
            const indexContract = await archethic.transaction.getTransactionIndex(contractAddress);

            console.log("contractSeed =", contractSeed)
            console.log("contractAddress =", Utils.uint8ArrayToHex(contractAddress))
            console.log("index =", indexContract)

            const contractBalance = await archethic.network.getBalance(contractAddress)
            console.log("contractBalance =", Utils.fromBigInt(contractBalance.uco), "UCO")
            if (Utils.fromBigInt(contractBalance.uco) < 1) {
                reject(`Invalid balance for the contract's address`)
                return
            }


            const managerSeed = "demo.charlie.mgnt.01"
            const managerAddress = Crypto.deriveAddress(managerSeed)

            let context =
            {
                seed : contractSeed,
                managerSeed : managerSeed,
                managerAddress : Utils.uint8ArrayToHex(managerAddress),
                index : indexContract,
                address : Utils.uint8ArrayToHex(contractAddress)
            }

            const contractTx = await buildContractTransaction(context)
            if (contractTx == null)
                {
                    reject(`Contract transaction failed - no Smart Contract File`)
                    return;
                }
            console.log(">>>>>>>Contract>>>>>>>>", Utils.uint8ArrayToHex(contractTx.address))

            const fee = await archethic.transaction.getTransactionFee(contractTx)
            console.log("Estimated Fee", fee)

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

                })
                .send()
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