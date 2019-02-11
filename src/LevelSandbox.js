/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/=================================================== */

const level = require('level');

const chainDB = './chaindata';

class LevelSandbox {
  constructor() {
    this.db = level(chainDB);
  }

  // Get data from levelDB with key
  async getLevelDBData(key) {
    let val;
    try {
      val = await this.db.get(key);
    } catch (err) {
      console.log('Not found!');
      return err;
    }
    return val;
  }

  // Add data to levelDB with key and value
  async addLevelDBData(key, value) {
    try {
      await this.db.put(key, value);
      return value;
    } catch (err) {
      console.log(`Block ${key} submission failed`, err);
      return err;
    }
  }

  // Method that return the height
  getBlocksCount() {
    return new Promise((resolve, reject) => {
      let height = -1;
      this.db.createReadStream().on('data', () => {
        height += 1;
      }).on('error', (err) => {
        reject(err);
      }).on('close', () => {
        resolve(height);
      });
    });
  }

  // Method that returns block by hash
  getBlockByHash(hash) {
    return new Promise((resolve, reject) => {
      let block;
      this.db.createReadStream().on('data', (data) => {
        block = JSON.parse(data.value);
        if (!LevelSandbox.isBlockFirst(block) && block.hash === hash) {
          resolve(block);
        }
      }).on('error', (err) => {
        reject(err);
      }).on('close', () => {
        reject(new Error('Block not found'));
      });
    });
  }

  // Method that returns block by address
  getBlocksByAddress(address) {
    return new Promise((resolve, reject) => {
      const blocks = [];
      let block;
      this.db.createReadStream().on('data', (data) => {
        block = JSON.parse(data.value);
        if (!LevelSandbox.isBlockFirst(block) && block.body && block.body.address === address) {
          blocks.push(block);
        }
      }).on('error', (err) => {
        reject(err);
      }).on('close', () => {
        resolve(blocks);
      });
    });
  }

  // Boolean to return whether the block passed is first or not
  static isBlockFirst(block) {
    return parseInt(block.height, 10) === 0;
  }
}

module.exports.LevelSandbox = LevelSandbox;
