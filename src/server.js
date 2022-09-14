import './config';
import Database from './database';
import environment from './config/environment';
import dbConfig from './config/database';

//we need to execute async code so we'll create an IIFE
(async () => {
  try {
    //connect to the Database
    const db = new Database(environment.nodeEnv, dbConfig);
    await db.connect();
  } catch (err) {
    console.error('Something went wrong when initializing the app:\n', err.stack);
  }
})();
