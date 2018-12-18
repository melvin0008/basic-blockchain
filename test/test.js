const expect = require('chai').expect;
const rimraf = require('rimraf');

const BlockChain = require('../BlockChain.js');
const Block = require('../Block.js');


let myBlockChain;
let blockChainheights = Array(10).fill(1).map((x,y) => x + y);
let block5;

describe('Blockchain', () => {
  before(() => {
    return new Promise(async (resolve) => {
      myBlockChain = new BlockChain.Blockchain();

      for (let i of blockChainheights) {
        let blockTest = new Block.Block("Test Block - " + (i));
        // Be careful this only will work if your method 'addBlock' in the Blockchain.js file return a Promise
        await myBlockChain.addBlock(blockTest);
      }
      resolve();
    });
  });

  describe('validity of blocks', function() {
    it('returns height 10', async() => {
      let height = await myBlockChain.getBlockHeight();
      expect(height).to.equal(10);
    });

    it('validates block zero', async() => {
      let validated = await myBlockChain.validateBlock(0);
      expect(validated).to.equal(true);
    });

    it('returns block zero with correct name', async() => {
      let block = await myBlockChain.getBlock(0);
      expect(block["body"]).to.equal(BlockChain.Blockchain.firstBlockData);
    });

    it('validates the entire blockchain', async() => {
      let chainValidatedErrors = await myBlockChain.validateChain();
      expect(chainValidatedErrors.length).to.equal(0);
    });

    describe('when block5 body is tampered', async() => {
      before(async() => {
        block5 = await myBlockChain.getBlock(5);
        const tamperedBlock5 = {...block5, body: "Tampered Block"}
        await myBlockChain._modifyBlock(tamperedBlock5.height, tamperedBlock5)
      });

      it("returns validation as false", async() => {
        let validated = await myBlockChain.validateBlock(5);
        expect(validated).to.equal(false);
      });

      after(async() => {
        await myBlockChain._modifyBlock(block5.height, block5);
      })
    })

    describe('when block5 hash is tampered', async() => {
      before(async() => {
        block5 = await myBlockChain.getBlock(5);
        const tamperedBlock5 = {...block5, hash: "jndininuud94j9i3j49dij9ijij39idj9oi"}
        await myBlockChain._modifyBlock(tamperedBlock5.height, tamperedBlock5)
      });

      it("returns validation as false", async() => {
        let validated = await myBlockChain.validateBlock(5);
        expect(validated).to.equal(false);
      });

      after(async() => {
        await myBlockChain._modifyBlock(block5.height, block5);
      })
    })
  });

  after(() => {
    return new Promise(async (resolve) => {
      for (let i of blockChainheights) {
        await myBlockChain.bd.db.del(i);
      }
      await myBlockChain.bd.db.close();
      resolve();
    });
  });
})