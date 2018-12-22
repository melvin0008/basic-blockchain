const express = require('express');
const bodyParser = require('body-parser');
const Block = require('./src/Block');
const BlockChain = require('./src/BlockChain');

const app = express();
app.use(bodyParser.json());

const blockchain = new BlockChain.Blockchain();
const port = 8000;

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
    return res.send(block);
  } catch (err) {
    return res.status(400).send({ error: `Block height ${height} out of bound` });
  }
});

/*
  POST route to post block
  @body body => [String] Data of the block to be created
*/
app.post('/block', async (req, res) => {
  const { body } = req.body;
  if (!body) {
    return res.status(400).send('Body not provided');
  }
  if (!(typeof body === 'string')) {
    return res.status(400).send('Body passed is not a string');
  }
  const block = new Block.Block(body);
  try {
    const blockCreated = await blockchain.addBlock(block);
    if (!blockCreated) {
      return res.status(500).send(`Block for data ${body} could not be added`);
    }
    return res.status(200).send('Block succesfully created');
  } catch (err) {
    return res.status(500).send(err);
  }
});

const server = app.listen(port, () => console.log(`Listening on port ${port}!`));

module.exports = app;
module.exports.server = server;
module.exports.blockchain = blockchain;
