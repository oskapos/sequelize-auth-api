import fs from 'fs';
import path from 'path';

let models = {};

export function registerModels(sequelize) {
  //get the current file name 'index.js'
  const thisFile = path.basename(__filename);
  //get the files in this directory and store them in an array
  const modelFiles = fs.readdirSync(__dirname);
  //filter only the Model files
  const filteredModelFiles = modelFiles.filter((file) => file !== thisFile && file.slice(-3) === '.js');

  for (const file of filteredModelFiles) {
    //get the default exported Model from that Model file
    const model = require(path.join(__dirname, file)).default(sequelize);
    //Add it to the models obj
    models[model.name] = model;
  }

  //Register associations of the models

  models.sequelize = sequelize;
}

export default models;
