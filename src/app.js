import express from 'express';
import logger from 'morgan';
import environment from './config/environment';
import { v1Routes } from './controllers';
import errorsMiddleware from './middlewares/errors';

class App {
  constructor() {
    this.app = express();
    //morgan logger middleware
    this.app.use(logger('dev', { skip: (req, res) => environment.nodeEnv === 'test' }));
    //Body parsers middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.setRoutes();
  }

  //Mounting Routes
  setRoutes() {
    this.app.use('/v1', v1Routes);
    //Registering The Global error handling middleware(must be at the end)
    this.app.use(errorsMiddleware);
  }

  getApp() {
    return this.app;
  }

  //Run Server
  listen() {
    const { port } = environment;
    this.app.listen(port, () => {
      console.log(`Listening at port ${port}`);
    });
  }
}

export default App;
