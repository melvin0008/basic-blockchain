const { expect } = require('chai');

const BlockChain = require('../src/BlockChain.js');
const Block = require('../src/Block.js');


let myBlockChain;
const blockChainheights = Array(10).fill(1).map((x, y) => x + y);
let block5;
let lastBlock;

describe('Blockchain', () => {
  before(() => new Promise(async (resolve) => {
    myBlockChain = new BlockChain.Blockchain();

    for (const i of blockChainheights) {
      const blockTest = new Block.Block(`Test Block - ${i}`);
      /* eslint-disable no-await-in-loop */
      await myBlockChain.addBlock(blockTest);
    }
    resolve();
  }));

  describe('validity of blocks', () => {
    it('returns height 10', async () => {
      const height = await myBlockChain.getBlockHeight();
      expect(height).to.equal(10);
    });

    it('validates block zero', async () => {
      const validated = await myBlockChain.validateBlock(0);
      expect(validated).to.equal(true);
    });

    it('returns block zero with correct name', async () => {
      const block = await myBlockChain.getBlock(0);
      expect(block.body).to.equal(BlockChain.Blockchain.firstBlockData);
    });

    it('validates the entire blockchain', async () => {
      const chainValidatedErrors = await myBlockChain.validateChain();
      expect(chainValidatedErrors.length).to.equal(0);
    });

    describe('when block5 body is tampered', async () => {
      before(async () => {
        block5 = await myBlockChain.getBlock(5);
        const tamperedBlock5 = { ...block5, body: 'Tampered Block' };
        await myBlockChain._modifyBlock(tamperedBlock5.height, tamperedBlock5);
      });

      it('returns validation as false', async () => {
        const validated = await myBlockChain.validateBlock(5);
        expect(validated).to.equal(false);
      });

      after(async () => {
        await myBlockChain._modifyBlock(block5.height, block5);
      });
    });

    describe('when block5 hash is tampered', async () => {
      before(async () => {
        block5 = await myBlockChain.getBlock(5);
        const tamperedBlock5 = { ...block5, hash: 'jndininuud94j9i3j49dij9ijij39idj9oi' };
        await myBlockChain._modifyBlock(tamperedBlock5.height, tamperedBlock5);
      });

      it('returns validation as false', async () => {
        const validated = await myBlockChain.validateBlock(5);
        expect(validated).to.equal(false);
      });

      after(async () => {
        await myBlockChain._modifyBlock(block5.height, block5);
      });
    });

    describe('when last blocks body is tampered', async () => {
      let height;
      before(async () => {
        height = await myBlockChain.getBlockHeight();
        lastBlock = await myBlockChain.getBlock(height);
        const tamperedLastBlock = { ...lastBlock, body: 'Tampered Block' };
        await myBlockChain._modifyBlock(tamperedLastBlock.height, tamperedLastBlock);
      });

      it('returns error length to be one', async () => {
        const chainValidatedErrors = await myBlockChain.validateChain();
        expect(chainValidatedErrors.length).to.equal(1);
      });

      it('returns error array with correct error height', async () => {
        const chainValidatedErrors = await myBlockChain.validateChain();
        expect(chainValidatedErrors).to.deep.equal([height]);
      });

      after(async () => {
        await myBlockChain._modifyBlock(lastBlock.height, lastBlock);
      });
    });

    describe('when last blocks hash is tampered', async () => {
      let height;
      before(async () => {
        height = await myBlockChain.getBlockHeight();
        lastBlock = await myBlockChain.getBlock(height);
        const tamperedLastBlock = { ...lastBlock, hash: 'jndininuud94j9i3j49dij9ijij39idj9oi' };
        await myBlockChain._modifyBlock(tamperedLastBlock.height, tamperedLastBlock);
      });

      it('returns error length to be one', async () => {
        const chainValidatedErrors = await myBlockChain.validateChain();
        expect(chainValidatedErrors.length).to.equal(1);
      });

      it('returns error array with correct error height', async () => {
        const chainValidatedErrors = await myBlockChain.validateChain();
        expect(chainValidatedErrors).to.deep.equal([height]);
      });

      after(async () => {
        await myBlockChain._modifyBlock(lastBlock.height, lastBlock);
      });
    });
  });

  after(() => new Promise(async (resolve) => {
    for (const i of blockChainheights) {
      await myBlockChain.bd.db.del(i);
    }
    await myBlockChain.bd.db.close();
    resolve();
  }));
});
