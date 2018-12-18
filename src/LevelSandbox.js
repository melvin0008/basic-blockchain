/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/=================================================== */

const level = require('level');

const chainDB = '../chaindata';

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
      return null;
    }
    return val;
  }

  // Add data to levelDB with key and value
  async addLevelDBData(key, value) {
    try {
      await this.db.put(key, value);
      return true;
    } catch (err) {
      console.log(`Block ${key} submission failed`, err);
      return false;
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
}

module.exports.LevelSandbox = LevelSandbox;
