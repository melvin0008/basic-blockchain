# Project #4. Build a Private Blockchain Notary Service

## Setup project for Review.

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.

## Manually running the project

run __npm start__
The server is runninng on port 8000

#### POST /requestValidation

Using Postman post { 'address': address } to http://localhost:8000/requestValidation
In the response you would be getting message which you would be using to signing.
After signing send the signature as a param to /message-signature/validate


#### POST /message-signature/validate
Using Postman post { 'address': address, 'signature': signature } to http://localhost:8000/message-signature/validate

This allows the address to be validated so that you can register a star

#### POST /block

Using Postman post { 'address': address, 'star': { 'ra': ra, 'dec': dec, 'story': story} } to http://localhost:8000/block


#### GET /block/:height

Open http://localhost:8000/block/:height replacing height with the height of the block you want

Make sure you have posted atleast one block

```
 curl http://localhost:8000/block/0
```

#### GET /stars/address:address


Get stars posted by address
Open http://localhost:8000/stars/address:address replacing :address with the :address of the address you want

Make sure you have posted atleast one block

```
 curl http://localhost:8000/stars/address:address
```

#### GET /stars/hash:hash


Get star whose hash is passed
Open http://localhost:8000/stars/hash:hash replacing :hash with the :hash of the hash you want

Make sure you have posted atleast one block

```
 curl http://localhost:8000/stars/hash:hash
```

