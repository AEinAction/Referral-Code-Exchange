import Archethic, { Crypto, Utils } from "@archethicjs/sdk"
import { randomBytes } from "crypto"
import { requestFaucet } from "./faucet.js"
 
const originPrivateKey = Utils.originPrivateKey;


async function run() {
    return new Promise(async function (resolve, reject) {
        try {
            const endpoint = process.env["ENDPOINT"] || "https://testnet.archethic.net"
            const archethic = new Archethic(endpoint)
            await archethic.connect()

            const seed = randomBytes(32)
            const address = Crypto.deriveAddress(seed)

            console.debug("Request funds from faucet...")
            await requestFaucet(Utils.uint8ArrayToHex(address), endpoint)

            const senderBalance = await archethic.network.getBalance(address)
            if (Utils.fromBigInt(senderBalance.uco) != 100) {
                reject(`Invalid balance for the sender's address`)
                return
            }

            console.debug("Funds received from faucet")

            const tx = archethic.transaction.new()
                .setType("token")
                .setContent(JSON.stringify({
                    supply: Utils.toBigInt(2),
                    name: "MyToken",
                    type: "non-fungible",
                    properties: {
                        description: "This is token used to test token creation"
                    },
                    collection: [
                        {
                            "image": "ipfs://bafybeibfhnw4uspjj2akxzkbeia4fxv37gkyvvs2skja5tomlcv3soo2hm",
                            "description": "strawberry in the space"
                        },
                        {
                            "image": "ipfs://QmRKs2ZfuwvmZA3QAWmCqrGUjV9pxtBUDP3wuc6iVGnjA2",
                            "description": "man alone in a spaceship's capsule"
                        }
                    ]
                }))
                .build(seed)
                .originSign(originPrivateKey)


            tx
                .on("sent", () => {
                    console.debug("NFT transaction sent")
                    console.debug("Await validation ...")
                })
                .on("requiredConfirmation", async (_confirmations, sender) => {
                    sender.unsubscribe()

                    console.debug(`Token transaction created - ${Utils.uint8ArrayToHex(tx.address)}`)

                    const senderBalance = await archethic.network.getBalance(address)

                    const tokens = senderBalance.token.filter(x => {
                        return x.address.toLowerCase() == Utils.uint8ArrayToHex(tx.address)
                    })

                    if (tokens.length != 2) {
                        reject(`Invalid balance for the sender's address (${Utils.uint8ArrayToHex(address)}) after send and should be 2 NFT`)
                        return
                    }

                    if (Utils.fromBigInt(tokens[0].amount) != 1 && Utils.fromBigInt(tokens[1].amount)) {
                        reject(`Invalid balance for the sender's address (${Utils.uint8ArrayToHex(address)}) after send and should be 2 NFT`)
                        return
                    }

                    if (tokens[0].tokenId != 1 && tokens[1].tokenId != 2) {
                        reject(`NFT should have incremental token ID`)
                        return
                    }

                    resolve("2 NFT have been minted")
                    return

                })
                .on("error", (context, reason) => {
                    reject(`Token transaction failed - ${reason}`)
                    return
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
    