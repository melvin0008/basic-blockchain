const express = require('express');
const bodyParser = require('body-parser');
const hex2ascii = require('hex2ascii');

const Block = require('./src/Block');
const BlockChain = require('./src/BlockChain');
const Mempool = require('./src/Mempool');

const app = express();
app.use(bodyParser.json());

const blockchain = new BlockChain.Blockchain();
const mempool = new Mempool.Mempool();

const port = 8000;

function addDecodedStory(block) {
  if (!block || !block.body || !block.body.star) {
    return block;
  }
  const storyDecoded = hex2ascii(block.body.star.story);
  return { ...block, body: { ...block.body, star: { ...block.body.star, storyDecoded } } };
}

app.get('', (req, res) => {
  const apiDoc = `Supported Api:
                  GET /block/:height where height is height of the block for which information is requested
                  POST /block with body { body : 'some string'} where body should be a string
                  `;
  res.send(apiDoc);
});


/*
  GET route to get block information
  @param :height => [Number] height of block to be retrieved
*/
app.get('/block/:height', async (req, res) => {
  const { height } = req.params;
  try {
    const block = await blockchain.getBlock(height);
    return res.send(addDecodedStory(block));
  } catch (err) {
    return res.status(400).send({ error: `Block height ${height} out of bound` });
  }
});

/*
  POST route to post block

  @Criteria: Web API POST endpoint with JSON response that submits the Star information to be saved in the Blockchain.
*/
app.post('/block', async (req, res) => {
  const { body } = req;
  if (!body) {
    return res.status(400).send({ error: 'Body not provided' });
  }

  const { address, star } = body;
  if (!address) {
    return res.status(400).send({ error: 'Address not provided' });
  }

  if (!mempool.isValid(address)) {
    return res.status(400).send({ error: 'Address has not been validated' });
  }

  if (!star) {
    return res.status(400).send({ error: 'Star not provided' });
  }

  const { dec, ra, story } = star;

  const starContent = { dec, ra, story: Buffer.from(story).toString('hex') };
  const blockContent = { address, star: starContent };

  const block = new Block.Block(blockContent);
  try {
    const blockCreated = await blockchain.addBlock(block);
    if (blockCreated && blockCreated.hash) {
      mempool.invalidateAddress(address);
      return res.status(200).send(blockCreated);
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

/*
  @Criteria: Get Star block by wallet address (blockchain identity) with JSON response.
*/
app.get('/stars/address:address', async (req, res) => {
  const { address } = req.params;
  try {
    const response = await blockchain.getBlocksByAddress(address.slice(1));
    const decodedResponse = [];
    for (let i = 0; i < response.length; i += 1) {
      decodedResponse.push(addDecodedStory(response[i]));
    }
    return res.send(addDecodedStory(decodedResponse));
  } catch (err) {
    return res.status(400).send({ error: 'Block not found' });
  }
});

/*
  @Criteria: Get star block by star block height with JSON response.
*/
app.get('/stars/hash:hash', async (req, res) => {
  const { hash } = req.params;
  try {
    const response = await blockchain.getBlockByHash(hash.slice(1));

    return res.send(addDecodedStory(response));
  } catch (err) {
    return res.status(400).send({ error: 'Block not found' });
  }
});

/*
  @Criteria1 : Web API POST endpoint to validate request with JSON response.
*/
app.post('/requestValidation', async (req, res) => {
  const { body } = req;

  if (!body) {
    return res.status(400).send({ error: 'Body not provided' });
  }
  const { address } = body;
  if (!address) {
    return res.status(400).send({ error: 'Address not provided' });
  }

  const request = mempool.getOrAddRequest(address);
  if (request) {
    return res.status(200).send(request);
  }
  return res.status(500).send({ error: 'Cannot create a request for validation' });
});

/*
  @Criteria2 : Web API POST endpoint validates message signature with JSON response.
*/
app.post('/message-signature/validate', async (req, res) => {
  const { body } = req;

  if (!body) {
    return res.status(400).send({ error: 'Body not provided' });
  }
  const { address, signature } = body;
  if (!address) {
    return res.status(400).send({ error: 'Address not provided' });
  }

  if (!signature) {
    return res.status(400).send({ error: 'Signature not provided' });
  }

  const requestValidity = mempool.validateRequest(address, signature);
  if (requestValidity) {
    return res.status(200).send(requestValidity);
  }
  return res.status(500).send({ error: 'Cannot create validation request' });
});

const server = app.listen(port, () => console.log(`Listening on wport ${port}!`));

module.exports = app;
module.exports.server = server;
module.exports.blockchain = blockchain;
