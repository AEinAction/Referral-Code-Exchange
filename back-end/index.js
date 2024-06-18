// src/index.js
require("dotenv").config({debug: true});


const express = require('express');
const axios = require('axios');
const cors = require('cors')
const helmet = require("helmet")
const https = require('https');

const app = express();
const port = process.env["PORT"] ||  3000;

const network = process.env["AE_NETWORK"] ||  "https://testnet.archethic.net/api";
 
app.use(helmet())
app.use(cors())

https.globalAgent.options.rejectUnauthorized = false;
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const instance = axios.create({ httpsAgent })

app.get('/balance/:id', async function (req, res) {

  // Should not happen
  if (req?.params?.id == null) {
    res.status(404).json({ code: 1000, message: "no address " })
    return;
  }

 // Call the Network for retrieving the balance of an address
 // AE exposes a GraphQL interface
 // More information on https://wiki.archethic.net/build/api/schema/queries/balance
  let body = JSON.stringify({
    query: `query {
            balance(address: "${req.params.id}") {
              uco,
              token {
                address,
                amount,
                tokenId
              }
            }
      }`
  })

  let headers = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  }


  let response = await instance.post(network, body,headers);
  if (response.status == 200) {
    res.json(response.data);
    return;
  }
 //if an error, we return an empty Wallet
  res.json({ data: { balance: { token: [], uco: 0 } } })

});


app.get('/', (req, res) => {
  res.send('AE Middleware 1.0');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});