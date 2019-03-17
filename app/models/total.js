/**
 * Module dependencies.
 */

// CREATE TABLE IF NOT EXISTS `total` (
//  `name` varchar(214) NOT NULL COMMENT 'total name',
//  `gmt_modified` datetime NOT NULL COMMENT 'modified time',
//  `module_delete` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT 'module delete count',
//  `last_sync_time` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT 'last timestamp sync from official registry',
//  `last_exist_sync_time` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT 'last timestamp sync exist packages from official registry',
//  `sync_status` tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'system sync from official registry status',
//  `need_sync_num` int unsigned NOT NULL DEFAULT '0' COMMENT 'how many packages need to be sync',
//  `success_sync_num` int unsigned NOT NULL DEFAULT '0' COMMENT 'how many packages sync success at this time',
//  `fail_sync_num` int unsigned NOT NULL DEFAULT '0' COMMENT 'how many packages sync fail at this time',
//  `left_sync_num` int unsigned NOT NULL DEFAULT '0' COMMENT 'how many packages left to be sync',
//  `last_sync_module` varchar(100) COMMENT 'last sync success module name',
//  PRIMARY KEY (`name`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='total info';
// -- init `total` count
// INSERT INTO total(name, gmt_modified) VALUES('total', now())
//   ON DUPLICATE KEY UPDATE gmt_modified=now();
const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  const Total = sequelize.define('Total', {
    name: {
      type: Sequelize.STRING(214),
      primaryKey: true,
      comment: 'total name'
    },
    module_delete: {
      type: Sequelize.BIGINT(20),
      allowNull: false,
      defaultValue: 0,
      comment: 'module delete count',
    },
    last_sync_time: {
      type: Sequelize.BIGINT(20),
      allowNull: false,
      defaultValue: 0,
      comment: 'last timestamp sync from official registry',
    },
    last_exist_sync_time: {
      type: Sequelize.BIGINT(20),
      allowNull: false,
      defaultValue: 0,
      comment: 'last timestamp sync exist packages from official registry',
    },
    sync_status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'system sync from official registry status',
    },
    need_sync_num: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'how many packages need to be sync',
    },
    success_sync_num: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'how many packages sync success at this time',
    },
    fail_sync_num: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'how many packages sync fail at this time',
    },
    left_sync_num: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'how many packages left to be sync',
    },
    last_sync_module: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'last sync success module name',
    },
  }, {
      tableName: 'total',
      comment: 'total info',
      createdAt: false,
      classMethods: {
        init: function (callback) {
          var that = Total;
          that.find({
            where: { name: 'total' }
          }).then(function (row) {
            if (!row) {
              that.build({ name: 'total' }).save()
                .then(function () {
                  callback();
                })
                .catch(callback);
              return;
            }
            callback();
          }).catch(callback);
        }
      }
    });

  return Total;
};
