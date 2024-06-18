//const { Crypto, Utils } = require("@archethicjs/sdk")
import Archethic, { Crypto, Utils } from "@archethicjs/sdk"

import { randomBytes } from "crypto"
import { requestFaucet } from "./faucet.js"



const originPrivateKey = Utils.originPrivateKey
let archethic




//content: Crypto.hash(contract.code)

/*
 #collection = []

  
  # body = 
  # [
    #    supply: 200000000,
    #     name: "1 Codes Parrainage Monerium",
    #    type: "non-fungible",
    #   symbol: "monerium-code-2",
   
    #    aeip: [2, 9],
    #    collection: []
    # ]
 

  # Contract.set_content Json.to_string(body)
  #  State.set("debug",  (body))
   # State.set("debug2",  Json.to_string(body))


*/

 

function contractCode() {
    return `@version 1

condition triggered_by: transaction, on: addCodes(code1,code2,code3), as: [ 
    content: true
    
]

actions triggered_by: transaction, on: addCodes(code1,code2,code3) do
  Contract.set_type "token"

  collection_1 = ""
  collection_2 = ""
  collection_3 = ""
  nb = "100000000"
  if (code1 != "") do
        nb = "100000000"
        collection_1 = "{
            \\\"description\\\": \\\"Code Parrainage Monerium\\\",
            \\\"name\\\":  \\\"Code Parrainage Monerium\\\",
            \\\"type_mime\\\": \\\"image/jpeg\\\",
            \\\"content\\\": {
               \\\"http\\\":\\\"https://monerium.com/imges/monerium-icon.png\\\"
             },
             \\\"code\\\": \\\"#{code1}\\\"
       }"
  end

  if (code2 != "") do
      nb = "200000000"
      collection_2 = ",{
    \\\"description\\\": \\\"Code Parrainage Monerium\\\",
    \\\"name\\\":  \\\"Code Parrainage Monerium\\\",
    \\\"type_mime\\\": \\\"image/jpeg\\\",
    \\\"content\\\": {
       \\\"http\\\":\\\"https://monerium.com/imges/monerium-icon.png\\\"
     },
     \\\"code\\\": \\\"#{code2}\\\"
}"

  end

  if (code3 != "") do
       nb = "300000000"
       collection_3 = ",{
    \\\"description\\\": \\\"Code Parrainage Monerium\\\",
    \\\"name\\\":  \\\"Code Parrainage Monerium\\\",
    \\\"type_mime\\\": \\\"image/jpeg\\\",
    \\\"content\\\": {
       \\\"http\\\":\\\"https://monerium.com/imges/monerium-icon.png\\\"
     },
     \\\"code\\\": \\\"#{code3}\\\"
}"

  end
 
 # State.set("collection_1", collection_1)
 # State.set("collection_2", collection_2)
 # State.set("collection_3", collection_3)
 # State.set("nb", nb)
 

  Contract.set_content "{
    \\\"supply\\\":  #{nb},
    \\\"name\\\": \\\"Codes Parrainage Monerium\\\",
    \\\"type\\\": \\\"non-fungible\\\",
    \\\"symbol\\\": \\\"monerium-code\\\",
    \\\"properties\\\": {
        \\\"description\\\": \\\"Codes Parrainage Monerium\\\",
        \\\"content\\\": {
            \\\"http\\\":\\\"https://monerium.com/imges/monerium-icon.png\\\"
        },
        \\\"type_mime\\\": \\\"image/jpeg\\\",
        \\\"name\\\":  \\\"Codes Parrainage Monerium\\\"
   },
    \\\"collection\\\": [ #{collection_1}#{collection_2}#{collection_3} ],
    \\\"aeip\\\": [
      2,
      9
    ]
}"
 
end



condition triggered_by: transaction, on: debug(), as: [ 
    content: true
]

actions triggered_by: transaction, on: debug() do
        

    address=""
    token_address=""
    token_id=""
    id=""
 


 end

condition triggered_by: transaction, on: transfer(), as: [ 
    content: (Map.size(contract.balance.tokens) > 0)
]

actions triggered_by: transaction, on: transfer() do
   t = ""
   i = 0

   Contract.set_type "transfer"

   if Map.size(contract.balance.tokens) > 0 do
            for pool_info in Map.keys(contract.balance.tokens) do
                t = pool_info.token_address
                i = pool_info.token_id
            end
   end
   Contract.add_token_transfer(
    to: transaction.address,
    amount: 1,
    token_id: i,
    token_address: t)
    
    State.set("debug", Map.size(contract.balance.tokens))

  #  State.set("debug2", i)
   #  State.set("debug", t)

end`
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

function getCallTransaction(contractAddress, callerSeed, index) {
    const hashCode = Utils.uint8ArrayToHex(Crypto.hash(contractCode()))

    return archethic.transaction.new()
        .setType("transfer")
        // .setContent(hashCode.toUpperCase().slice(2))
        .setContent("in")
        .addRecipient(contractAddress, "addCodes", ["x1", "x2", "x3"])
        .build(callerSeed, index)
        .originSign(originPrivateKey)
}


function getCallTransactionTransferNFT(contractAddress, callerSeed, index, tokenAddress) {
    const hashCode = Utils.uint8ArrayToHex(Crypto.hash(contractCode()))

    let to = "0000F2A0924016BEEFAA55AF3FE4C62F49811DAE6B3B473D4B2C39B826B55A5FE021"
    return archethic.transaction.new()
        .setType("transfer")
        .addTokenTransfer(to, 100000000, tokenAddress, 1)
        .build(callerSeed, index)
        .originSign(originPrivateKey)
}


async function getCallTransactionCreateNFT(contractAddress, callerSeed, index) {
    const hashCode = Utils.uint8ArrayToHex(Crypto.hash(contractCode()))
    const secretKey = Crypto.randomSecretKey();
    const cipher = Crypto.aesEncrypt(callerSeed, secretKey);

    const storageNoncePublicKey = await archethic.network.getStorageNoncePublicKey()

    const encryptedSecretKey = Crypto.ecEncrypt(secretKey, storageNoncePublicKey);
    const authorizedKeys = [
        {
            publicKey: storageNoncePublicKey,
            encryptedSecretKey: encryptedSecretKey,
        }
    ]
    console.log("getCallTransactionCreateNFT", callerSeed, index)

    let token = JSON.stringify({
        supply: 100000000,
        name: "MyToken",
        type: "non-fungible",
        properties: {
            description: "This is token used to test token creation",
            "image": "https://monerium.com/imges/monerium-icon.png",
        },
        "aeip": [2]
    })

    return archethic.transaction.new()
        .setType("token")
        .setContent(token)
        .addOwnership(cipher, authorizedKeys)
        .build(callerSeed, index)
        .originSign(originPrivateKey)
}



async function run() {
    return new Promise(async function (resolve, reject) {
        try {
            const endpoint = process.env["ENDPOINT"] || "https://testnet.archethic.net"

            archethic = new Archethic(endpoint)
            await archethic.connect()

            const contractSeed = "philippe.valette.nft.01" //randomBytes(32)
            const contractAddress = Crypto.deriveAddress(contractSeed)

            console.log("contractSeed =", contractSeed)
            console.log("contractAddress =", Utils.uint8ArrayToHex(contractAddress))

            const contractBalance = await archethic.network.getBalance(contractAddress)
            console.log("contractBalance =", Utils.fromBigInt(contractBalance.uco), "UCO")
            if (Utils.fromBigInt(contractBalance.uco) < 10) {
                reject(`Invalid balance for the contract's address`)
                return
            }
            console.log(contractBalance)


            const indexContract = await archethic.transaction.getTransactionIndex(contractAddress);


            //  process.exit()
            const contractTx = await getCallTransactionTransferNFT(contractAddress, contractSeed, indexContract,"00009A206915185BF0CDB92115E649C643D30DD27E805549A4C3B5C1ADDCACE0A9A2")
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
                .on("requiredConfirmation", async (confirmations, sender) => {
                    sender.unsubscribe()

                    console.debug(`Contract transaction created - ${Utils.uint8ArrayToHex(contractTx.address)}`)



                    const contractBalance = await archethic.network.getBalance(contractAddress)
                    console.log("contractBalance =", Utils.fromBigInt(contractBalance.uco), "UCO")
                    if (Utils.fromBigInt(contractBalance.uco) < 10) {
                        reject(`Invalid balance for the contract's address`)
                        return
                    }
                    console.log(contractBalance)
                   

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