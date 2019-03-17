/**
 * Module dependencies.
 */

/*
 CREATE TABLE IF NOT EXISTS `module_log` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
 `gmt_create` datetime NOT NULL COMMENT 'create time',
 `gmt_modified` datetime NOT NULL COMMENT 'modified time',
 `username` varchar(100) NOT NULL COMMENT 'which username',
 `name` varchar(214) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'module name',
 `log` longtext COMMENT 'the raw log',
 PRIMARY KEY (`id`),
 KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='module sync log';
 */
const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  return sequelize.define('ModuleLog', {
    username: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'user name'
    },
    name: {
      type: Sequelize.STRING(214),
      allowNull: false,
      comment: 'module name',
    },
    log: {
      type: Sequelize.LONGTEXT,
      comment: 'the raw log',
    }
  }, {
      tableName: 'module_log',
      comment: 'module sync log',
      indexes: [
        {
          fields: ['name'],
        }
      ],
      classMethods: {
      }
    });
};
