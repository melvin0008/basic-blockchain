/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain |
|  ================================================ */

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {
  // @Criteria: Configure simpleChain.js with levelDB to persist blockchain
  //            dataset using the level Node.js library.
  constructor() {
    this.bd = new LevelSandbox.LevelSandbox();
  }

  static get firstBlockData() {
    return 'First block in the chain - Genesis block';
  }

  // Auxiliar method to create a Genesis Block (always with height= 0)
  // You have to options, because the method will always execute when you create your blockchain
  // you will need to set this up statically or instead you can verify if the height !== 0 then you
  // will not create the genesis block
  // @Criteria Genesis block persist as the first block in the blockchain using LevelDB
  async generateGenesisBlock() {
    const height = await this.getBlockHeight();
    if (height !== -1) return false;
    return this._addBlockToDB(new Block.Block(Blockchain.firstBlockData), -1);
  }

  // Get block height, it is auxiliar method that return the height of the blockchain
  // @Criteria Modify getBlockHeight() function to retrieve
  //           current block height within the LevelDB chain.
  async getBlockHeight() {
    return this.bd.getBlocksCount();
  }

  // Add new block
  // @Criteria addBlock(newBlock) function includes a method to store newBlock with LevelDB.
  async addBlock(block) {
    let height = await this.getBlockHeight();
    if (height === -1) {
      await this.generateGenesisBlock();
      height += 1;
    }
    const blockCreated = await this._addBlockToDB(block, height);
    return JSON.parse(blockCreated);
  }

  // Get Block By Height
  // @Criteria Modify getBlock() function to retrieve a block by it's block
  // height within the LevelDB chain.
  async getBlock(height) {
    const blockData = await this.bd.getLevelDBData(height);
    return JSON.parse(blockData);
  }

  // Validate if Block is being tampered by Block Height
  // @Criteria Modify the validateBlock() function to validate a block stored within levelDB
  async validateBlock(height) {
    const block = await this.getBlock(height);
    const blockHash = block.hash;
    block.hash = '';
    const validateBlockHash = Blockchain._generateBlockHash(block);
    if (blockHash === validateBlockHash) {
      return true;
    }
    console.log(`Block #${height} invalid hash:\n${blockHash}<>${validateBlockHash}`);
    return false;
  }

  // Validate Blockchain
  // @Criteria Modify the validateChain() function to validate blockchain stored within levelDB
  async validateChain() {
    const errorLog = [];
    let previousBlockHash = '';
    const currentHeight = await this.getBlockHeight();
    for (let height = 0; height <= currentHeight; height += 1) {
      /* eslint-disable no-await-in-loop */
      if (!await this.validateBlock(height)) errorLog.push(height);
      const block = await this.getBlock(height);
      if (block.previousBlockHash !== previousBlockHash) {
        errorLog.push(height);
      }
      previousBlockHash = block.hash;
    }

    if (errorLog.length > 0) {
      console.log(`Block errors = ${errorLog.length}`);
      console.log(`Blocks: ${errorLog}`);
    } else {
      console.log('No errors detected');
    }
    return errorLog;
  }

  // Utility Method to Tamper a Block for Test Validation
  // This method is for testing purpose
  _modifyBlock(height, block) {
    const self = this;
    return new Promise((resolve, reject) => {
      self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
        resolve(blockModified);
      }).catch((err) => { console.log(err); reject(err); });
    });
  }

  static _generateBlockHash(block) {
    return SHA256(JSON.stringify(block)).toString();
  }

  async _addBlockToDB(newBlock, height) {
    const block = newBlock;
    block.height = height + 1;
    block.time = new Date().getTime().toString().slice(0, -3);

    if (block.height > 0) {
      const previousBlock = await this.getBlock(block.height - 1);
      block.previousBlockHash = previousBlock.hash;
    }
    block.hash = Blockchain._generateBlockHash(block);
    return this.bd.addLevelDBData(block.height, JSON.stringify(block));
  }
}

module.exports.Blockchain = Blockchain;
