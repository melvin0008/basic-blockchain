const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;

describe ('StarNotary', () => {
  contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
  });

  it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
  });

  it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
  });

  it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
  });

  it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
  });

  it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
  });

  // Implement Task 2 Add supporting unit tests
  describe('#lookUptokenIdToStarInfo', () => {
    const expectedStarName = 'TestStar';
    const tokenId = 10;

    before(async() => {
      let instance = await StarNotary.deployed();
      await instance.createStar(expectedStarName, tokenId, {from: accounts[0]})
    });

    it('lookUptokenIdToStarInfo test', async() => {
      let instance = await StarNotary.deployed();
      expect(await instance.lookUptokenIdToStarInfo(tokenId)).to.equal(expectedStarName);
    });
  });

  describe('#name', () => {
    const expectedStarName = 'NameStart';
    const tokenId = 11;

    before(async() => {
      let instance = await StarNotary.deployed();
      await instance.createStar(expectedStarName, tokenId, {from: accounts[0]})
    });
    it('returns name of the contract', async() => {
      let instance = await StarNotary.deployed();
      expect(await instance.name.call()).to.equal("CrytoUniqueStar");
    });
  });

  describe('#symbol', () => {
    const expectedStarName = 'SymbolStar';
    const tokenId = 12;

    before(async() => {
      let instance = await StarNotary.deployed();
      await instance.createStar(expectedStarName, tokenId, {from: accounts[0]})
    });
    it('returns symbol of the contract', async() => {
      let instance = await StarNotary.deployed();
      expect(await instance.symbol.call()).to.equal("CUS");
    });
  });

  describe('#exchangeStars', () => {
    const tokenId1 = 14;
    const tokenId2 = 15;
    const token1Owner = accounts[0];
    const token2Owner = accounts[1];
    before(async() => {
      let instance = await StarNotary.deployed();
      await instance.createStar("Owner1Star", tokenId1, {from: token1Owner});
      await instance.createStar("Owner2Star", tokenId2, {from: token2Owner});
      await instance.exchangeStars(tokenId1, tokenId2, {from: token1Owner});
    });

    it('lets 2 users exchange stars', async() => {
      let instance = await StarNotary.deployed();
      expect(await instance.ownerOf.call(tokenId1)).to.equal(token2Owner);
      expect(await instance.ownerOf.call(tokenId2)).to.equal(token1Owner);
    });
  });

  describe('#transferStar', () => {
    const tokenId = 13;
    const sender = accounts[0];
    const receiver = accounts[1];
    before(async() => {
      let instance = await StarNotary.deployed();
      await instance.createStar("TransferStar", tokenId, {from: sender});
      await instance.transferStar(receiver, tokenId, {from: sender});
    });

    it('transfers ownership to the receiver', async() => {
      let instance = await StarNotary.deployed();
      expect(await instance.ownerOf.call(tokenId)).to.equal(receiver);
    });
  });
});