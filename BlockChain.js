/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock().then(created => { if (created) console.log("Successfully created first block") });
    }

    // Auxiliar method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    async generateGenesisBlock() {
        // Add your code here
        let height = await this.getBlockHeight();
        if (height !== -1) return false;
        return await this.addBlock(new Block.Block("First block in the chain - Genesis block"));
    }

    // Get block height, it is auxiliar method that return the height of the blockchain
    async getBlockHeight() {
        // Add your code here
        return this.bd.getBlocksCount();
    }

    // Add new block
    async addBlock(block) {
        // Add your code here
        const height = await this.getBlockHeight();
        block.height = height + 1;
        block.time = new Date().getTime().toString().slice(0,-3);

        if (block.height > 0) {
            const previousBlock = await this.getBlock(block.height - 1);
            block.previousBlockHash = previousBlock.hash;
        }
        block.hash = this._generateBlockHash(block);
        return await this.bd.addLevelDBData(block.height, JSON.stringify(block));
    }

    // Get Block By Height
    async getBlock(height) {
        // Add your code here
        let blockData = await this.bd.getLevelDBData(height);
        return JSON.parse(blockData);
    }

    // Validate if Block is being tampered by Block Height
    async validateBlock(height) {
        // Add your code here
        let block = await this.getBlock(height);
        let blockHash = block.hash;
        block.hash = '';
        let validateBlockHash = this._generateBlockHash(block);
        if (blockHash === validateBlockHash) {
            return true;
        } else {
            console.log('Block #' + height + ' invalid hash:\n' + blockHash + '<>' + validateBlockHash);
            return false;
        }
    }

    // Validate Blockchain
    async validateChain() {
        // Add your code here
        let errorLog = [];
        let previousBlockHash = "";
        let currentHeight = await this.getBlockHeight();
        for (let height = 0; height < currentHeight; height++) {
            if (!await this.validateBlock(height)) errorLog.push(height);
            let block = await this.getBlock(height);
            if (block.previousBlockHash != previousBlockHash) {
                errorLog.push(height);
            }
            previousBlockHash = block.hash;
        }

        if (errorLog.length > 0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: ' + errorLog);
        } else {
            console.log('No errors detected');
        }
        return errorLog;
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }

    _generateBlockHash(block) {
        return SHA256(JSON.stringify(block)).toString();
    }
}

module.exports.Blockchain = Blockchain;