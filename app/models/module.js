/**
 * Module dependencies.
 */

/*
CREATE TABLE IF NOT EXISTS `module` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
 `gmt_create` datetime NOT NULL COMMENT 'create time',
 `gmt_modified` datetime NOT NULL COMMENT 'modified time',
 `author` varchar(100) NOT NULL COMMENT 'module author',
 `name` varchar(214) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'module name',
 `version` varchar(30) NOT NULL COMMENT 'module version',
 `description` longtext COMMENT 'module description',
 `package` longtext CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT 'package.json',
 `dist_shasum` varchar(100) DEFAULT NULL COMMENT 'module dist SHASUM',
 `dist_tarball` varchar(2048) DEFAULT NULL COMMENT 'module dist tarball',
 `dist_size` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'module dist size',
 `publish_time` bigint(20) unsigned COMMENT 'module publish time',
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_name` (`name`,`version`),
 KEY `idx_gmt_modified` (`gmt_modified`),
 KEY `idx_publish_time` (`publish_time`),
 KEY `idx_author` (`author`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='module info';
*/
const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  const Module = sequelize.define('Module', {
    author: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'first maintainer name'
    },
    name: {
      type: Sequelize.STRING(214),
      allowNull: false,
      comment: 'module name'
    },
    version: {
      type: Sequelize.STRING(30),
      allowNull: false,
      comment: 'module version'
    },
    description: {
      type: Sequelize.LONGTEXT,
      comment: 'module description',
    },
    package: {
      type: Sequelize.LONGTEXT,
      comment: 'package.json',
    },
    dist_shasum: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'module dist SHASUM',
    },
    dist_tarball: {
      type: Sequelize.STRING(2048),
      allowNull: true,
      comment: 'module dist tarball',
    },
    dist_size: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'module dist size',
    },
    publish_time: {
      type: Sequelize.BIGINT(20),
      allowNull: true,
      comment: 'module publish time',
    }
  }, {
      tableName: 'module',
      comment: 'module info',
      indexes: [
        {
          unique: true,
          fields: ['name', 'version'],
        },
        {
          fields: ['gmt_modified'],
        },
        {
          fields: ['publish_time'],
        },
        {
          fields: ['author'],
        }
      ],
      classMethods: {
        findByNameAndVersion: function (name, version) {
          return Module.find({
            where: { name: name, version: version }
          });
        }
      }
    });

  return Module;
};
