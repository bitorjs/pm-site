/*
CREATE TABLE IF NOT EXISTS `module_abbreviated` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
 `gmt_create` datetime NOT NULL COMMENT 'create time',
 `gmt_modified` datetime NOT NULL COMMENT 'modified time',
 `name` varchar(214) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'module name',
 `version` varchar(30) NOT NULL COMMENT 'module version',
 `package` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'the abbreviated metadata',
 `publish_time` bigint(20) unsigned COMMENT 'the publish time',
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_name` (`name`,`version`),
 KEY `idx_gmt_modified` (`gmt_modified`),
 KEY `idx_publish_time` (`publish_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='module abbreviated info';
 */
const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  const ModuleAbbreviated = sequelize.define('ModuleAbbreviated', {
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
    package: {
      type: Sequelize.LONGTEXT,
      comment: 'package.json',
    },
    publish_time: {
      type: Sequelize.BIGINT(20),
      allowNull: true,
      comment: 'the publish time',
    }
  }, {
      tableName: 'module_abbreviated',
      comment: 'module abbreviated info',
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
      ],
    });

  ModuleAbbreviated.findByNameAndVersion = async (name, version) => {
    return await ModuleAbbreviated.findOne({
      where: { name: name, version: version }
    });
  }

  return ModuleAbbreviated;
};
