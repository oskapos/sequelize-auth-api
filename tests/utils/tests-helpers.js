import '../../src/config';
import Database from '../../src/database';
import dbConfig from '../../src/config/database';

let db;

class TestsHelpers {
  static async startDb() {
    db = new Database('test', dbConfig);
    await db.connect();
    return db;
  }

  static async stopDb() {
    await db.disconnect();
  }

  static async syncDb() {
    await db.sync();
  }

  static getApp() {
    //Importing the App late so that the models are populated by now
    const App = require('../../src/app').default;
    return new App().getApp();
  }
}

export default TestsHelpers;
