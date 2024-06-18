
# Middleware API


> This middleware is there only to bypass an issue between HTTPS certificates & AE JS SDK. The Archethic Dev Team is working to resolve the issue


The objective of this module is to expose API endpoints to retrieving information from the Archethic blockchain.

Endpoints available

**GET /balance/*:address***
This endpoint returns the   balance of the wallet having the address ":address'.
ex: GET /balance/000066BF1E58A896F3938A2604F4960738227A7FEB9691EB8DA66BCD9FCC0FF6DA1C


## Installation & Launch

**Prerequisites**: NodeJS must be installed and you have cloned the repository.

Move to the folder of the middleware

    cd back-end

Install nodeJS packages

    npm i

Run the application

    npm run serve

You should see 

    [server]: Server is running at http://localhost:3500

By default, the server is listen on the port 3500, this can be changed in the `.env` file by changing the value of `PORT`

To test that the API works, you can copy the following URL in your browser

[localhost:3500/balance/000066BF1E58A896F3938A2604F4960738227A7FEB9691EB8DA66BCD9FCC0FF6DA1C](http://localhost:3500/balance/000066BF1E58A896F3938A2604F4960738227A7FEB9691EB8DA66BCD9FCC0FF6DA1C)

The response will be similar to 

    {
            "data": {
                "balance": {
                    "token": [
                        {
                            "address": "00000E3F0F4BC26E4B757742AE5CAAA0DD1F1CC402C95BF84DBBD11174A90EF6016C",
                            "amount": 6876791377190042,
                            "tokenId": 0
                        }
                    ],
                    "uco": 12000000000
                }
            }
    }



## Deployment

The deployment can be done on VERCEL platform (https://vercel.com/) 
You have just to launch (after having installed Vercel CLI)

    vercel deploy

or for a production deployment

    vercel deploy --prod

The url of the middleware can be set in the Vercel console. 
Don't forget to set environmental variables.

  ## Development

This application is a standard template of a middleware based on express package

The module use the following packages
**axios**:  Allow to initiate HTTP calls
**dotenv**:  Allow to set to set environmental variables in a file `.env`
**cors**:  Authorize call via the browser
**helmet**:  Remove unnecessary HTTP headers
**https**:  Use to bypasse HTTPS Certificate issues

To retrieve the balance of a Wallet, we relay on the GraphQL API of Archethic.
The query is

    query {
          balance(address: <address>) {
             uco,
             token {
               address,
               amount,
               tokenId
             }
           }
    }

The  `<address>` parameter must be replaced by the address of the wallet


