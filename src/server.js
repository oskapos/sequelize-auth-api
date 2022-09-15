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

    //Import the App and set up the server
    const App = require('./app').default;
    const app = new App();
    app.listen();
  } catch (err) {
    console.error('Something went wrong when initializing the app:\n', err.stack);
  }
})();
