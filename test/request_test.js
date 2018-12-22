const chai = require('chai');
const chaiHttp = require('chai-http');
const importLazy = require('import-lazy')(require);

const server = importLazy('../index');

const { expect } = chai;

const BlockChain = require('../src/BlockChain.js');
const Block = require('../src/Block.js');


let myBlockChain;
const blockChainheights = Array(10).fill(1).map((x, y) => x + y);

describe('Blockchain', () => {
  before(() => new Promise(async (resolve) => {
    myBlockChain = new BlockChain.Blockchain();
    for (const i of blockChainheights) {
      const blockTest = new Block.Block(`Test Block - ${i}`);
      /* eslint-disable no-await-in-loop */
      await myBlockChain.addBlock(blockTest);
    }
    await myBlockChain.bd.db.close();
    resolve();
  }));

  describe('Requests', () => {
    chai.use(chaiHttp);
    describe('GET', () => {
      describe('/GET block 0', () => {
        it('it should GET block 0', (done) => {
          chai.request(server).get('/block/0')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.body).to.equal('First block in the chain - Genesis block');
              done();
            });
        });
      });

      describe('/GET block 100', () => {
        it('it should GET block 100', (done) => {
          chai.request(server)
            .get('/block/100')
            .end((err, res) => {
              expect(res).to.have.status(400);
              done();
            });
        });
      });
    });

    describe('POST', async () => {
      describe('POST with body', () => {
        it('it should post block', async () => {
          const height = await server.blockchain.getBlockHeight();
          const res = await chai.request(server)
            .post('/block')
            .send({
              body: 'Random block',
            });

          expect(res).to.have.status(200);
          const newHeight = await server.blockchain.getBlockHeight();
          expect(newHeight).to.equal(height + 1);
        });
      });

      describe('POST with empty body', () => {
        it('it should not post block', async () => {
          const height = await server.blockchain.getBlockHeight();
          const res = await chai.request(server)
            .post('/block')
            .send({
              body: '',
            });

          expect(res).to.have.status(400);
          const newHeight = await server.blockchain.getBlockHeight();
          expect(newHeight).to.equal(height);
        });
      });

      describe('POST with no body', () => {
        it('it should not post block', async () => {
          const height = await server.blockchain.getBlockHeight();
          const res = await chai.request(server)
            .post('/block')
            .send({});

          expect(res).to.have.status(400);
          const newHeight = await server.blockchain.getBlockHeight();
          expect(newHeight).to.equal(height);
        });
      });

      describe('POST with incorrect body type', () => {
        it('it should not post block', async () => {
          const height = await server.blockchain.getBlockHeight();
          const res = await chai.request(server)
            .post('/block')
            .send({
              body: true,
            });

          expect(res).to.have.status(400);
          const newHeight = await server.blockchain.getBlockHeight();
          expect(newHeight).to.equal(height);
        });
      });
    });
  });

  after(() => new Promise(async (resolve) => {
    myBlockChain = server.blockchain;
    const height = await myBlockChain.getBlockHeight();
    const totalArray = Array(height).fill(0).map((x, y) => x + y);
    totalArray.push(height);
    for (const i of totalArray) {
      await myBlockChain.bd.db.del(i);
    }
    await myBlockChain.bd.db.close();
    await server.server.close();
    resolve();
  }));
});
