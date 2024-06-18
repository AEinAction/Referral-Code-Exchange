import Archethic, { Crypto, Utils } from "@archethicjs/sdk"

import { randomBytes } from "crypto"
import { requestFaucet } from "./faucet.js"

/*


  Future<String> _getGenesisPublicKey(String address) async {
    final connectivityStatusProvider = ref.read(connectivityStatusProviders);
    if (connectivityStatusProvider == ConnectivityStatus.isDisconnected) {
      return '';
    }

    final publicKeyMap =
        await sl.get<archethic.ApiService>().getTransactionChain(
      {address: ''},
      request: 'previousPublicKey',
    );
    var publicKey = '';
    if (publicKeyMap.isNotEmpty &&
        publicKeyMap[address] != null &&
        publicKeyMap[address]!.isNotEmpty) {
      publicKey = publicKeyMap[address]![0].previousPublicKey!;
    }

    return publicKey;
  }


*/


const originPrivateKey = Utils.originPrivateKey
let archethic


function encryptSecret(
    secret,
    ...publicKeys
) {
    const aesKey = Crypto.randomSecretKey();
    const encryptedSecret = Crypto.aesEncrypt(secret, aesKey);

    const authorizedKeys = publicKeys.map((publicKey) => {
        const encryptedAesKey = Utils.uint8ArrayToHex(Crypto.ecEncrypt(aesKey, publicKey));
        return { encryptedSecretKey: encryptedAesKey, publicKey: Utils.maybeUint8ArrayToHex(publicKey) };
    });

    return { encryptedSecret, authorizedKeys };
}

/**
 * Decrypt a secret if authorized
 * @param {Uint8Array} encryptedSecret The secret to decrypt
 * @param {AuthorizedKeyUserInput[]} authorizedKeys The AES keys of authorized keys
 * @param {Keypair} keyPair The keyPair to use for decrypting
 * @returns {Uint8Array} The decrypted secret
 * @example
 * const keypair = deriveKeyPair("seed", 0);
 * const { encryptedSecret, authorizedKeys } = encryptSecret("something secret", keypair.publicKey);
 * const decryptedSecret = decryptSecret(encryptedSecret, authorizedKeys, keypair);
 */
function decryptSecret(
    encryptedSecret,
    authorizedKeys,
    keyPair
) {
    const publicKeyInHex = Utils.uint8ArrayToHex(keyPair.publicKey);

    const authorizedKey = authorizedKeys.find(({ publicKey: currentPubKey }) => currentPubKey == publicKeyInHex);
    if (!authorizedKey) throw new Error("This keypair is not authorized to decrypt the secret");

    const aesKey = Crypto.ecDecrypt(authorizedKey.encryptedSecretKey, keyPair.privateKey);
    return Crypto.aesDecrypt(encryptedSecret, aesKey);
}



/*
  const keypair = Crypto.deriveKeyPair("seed", 0);
 
  const result = encryptSecret(secret, keypair.publicKey);
 
  console.log(result)
 
  const secretDecrypted = decryptSecret(result.encryptedSecret, result.authorizedKeys, keypair);
 
  console.log(Utils.deserializeString(secretDecrypted))
  */


function getCallTransaction(callerSeed, index) {


    let token = JSON.stringify({
        supply: Utils.toBigInt(1),
        name: "MyToken",
        type: "non-fungible",
        properties: {
            description: "This is token used to test token creation"
        },
        collection: [
            {
                "image": "https://monerium.com/imges/monerium-icon.png",
                "description": "strawberry in the space"
            },
            {
                "image": "https://monerium.com/imges/monerium-icon.png",
                "description": "man alone in a spaceship's capsule"
            }
        ]
    })


    console.log("Call by", callerSeed, index)


    return archethic.transaction.new()
        // .setType("token")
        // .setContent(token)
        .setType("transfer")
        .setContent("ok")
        //.addRecipient(contractAddress, "transfer" )
        // .addRecipient(contractAddress, "addCodes", [ "qqqqqqqqqqqqq",
        // "",
        // ""])
        .build(callerSeed, index)
        .originSign(originPrivateKey)
}






async function run() {


    const endpoint = "http://64.227.136.218:40000"

    archethic = new Archethic(endpoint)

    await archethic.connect()

    let publicKey = "00003B8BC04B8DD5BCADDCA821B9EAD3257E3BED06BB87F0B2DAE7C457ECF43B59ED"

    let publicKeyUINT8 = Utils.hexToUint8Array(publicKey);


    const seed = "test.nft.private.att.3"


    const address = Crypto.deriveAddress(seed)

    console.log("contractSeed =", seed)
    console.log("contractAddress =", Utils.uint8ArrayToHex(address))


    const index = await archethic.transaction.getTransactionIndex(address);
    console.log("index =", index)
    // const keypair = Crypto.deriveKeyPair("seed", 0);

    // console.log(keypair.publicKey)/

    const senderBalance = await archethic.network.getBalance(address)
    if (Utils.fromBigInt(senderBalance.uco) == 0) {
        console.log("callerAddress =", Utils.uint8ArrayToHex(address))
        return
    }
    console.log("senderBalance =", Utils.fromBigInt(senderBalance.uco), "UCO")

    const secret = "{ \"tot\" : \"12\"} ";
    const secretKey = Crypto.randomSecretKey();
    const cipher = Crypto.aesEncrypt(secret, secretKey);

    const encryptedSecretKey = Crypto.ecEncrypt(secretKey, publicKeyUINT8);
    const authorizedKeys = [
        {
            publicKey: publicKeyUINT8,
            encryptedSecretKey: encryptedSecretKey,
        }
    ]
    console.log(authorizedKeys)
    /*------------------------------------------------*/
    //  const authorizedKey = authorizedKeys[0];
    //  if (!authorizedKey) throw new Error("This keypair is not authorized to decrypt the secret");

    //  const aesKey = Crypto.ecDecrypt(authorizedKey.encryptedSecretKey, keypair.privateKey);
    //  const r = Crypto.aesDecrypt(cipher, aesKey);

    //  console.log(Utils.deserializeString(r))


    let callTx = getCallTransaction(seed, index)
    const result = await archethic.transaction.getTransactionFee(callTx)
    console.log(result)

    callTx
        .on("sent", () => {
            console.debug("Contract's call transaction sent")
            console.debug("Await validation ...")
        })
        .on("error", (context, reason) => {
            console.log(context)
            console.log(`Contract's call transaction failed - ${reason}`)
            return
        })
        .on("requiredConfirmation", async (confirmations, sender) => {
            sender.unsubscribe()
            console.debug(`Contract's call transaction created - ${Utils.uint8ArrayToHex(callTx.address)}`)
        })
        .send()
}



run()