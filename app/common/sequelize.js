
import Sequelize from 'sequelize';

import config from '../../config/app.config';


var database = config.database;

// sync database before app start, defaul is false
database.syncFirst = false;

// add longtext for mysql
Sequelize.LONGTEXT = Sequelize.LONGTEXT = Sequelize.TEXT;
if (config.dialect === 'mysql') {
  Sequelize.LONGTEXT = Sequelize.LONGTEXT = 'LONGTEXT';
}

database.define = {
  timestamps: true,
  createdAt: 'gmt_create',
  updatedAt: 'gmt_modified',
  charset: 'utf8',
  collate: 'utf8_general_ci',
};

var sequelize = new Sequelize(database.db, database.username, database.password, database);

export default sequelize;
