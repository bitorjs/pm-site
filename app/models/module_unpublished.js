/**
 * Module dependencies.
 */

var utils = require('./utils');

/*
CREATE TABLE IF NOT EXISTS `module_unpublished` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
 `gmt_create` datetime NOT NULL COMMENT 'create time',
 `gmt_modified` datetime NOT NULL COMMENT 'modified time',
 `name` varchar(214) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'module name',
 `package` longtext CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT 'base info: tags, time, maintainers, description, versions',
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_name` (`name`),
 KEY `idx_gmt_modified` (`gmt_modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='module unpublished info';
 */
const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  const ModuleUnpublished = sequelize.define('ModuleUnpublished', {
    name: {
      type: Sequelize.STRING(214),
      allowNull: false,
      comment: 'module name',
    },
    package: {
      type: Sequelize.LONGTEXT,
      comment: 'base info: tags, time, maintainers, description, versions',
      get: utils.JSONGetter('package'),
      set: utils.JSONSetter('package'),
    }
  }, {
      tableName: 'module_unpublished',
      comment: 'module unpublished info',
      indexes: [
        {
          unique: true,
          fields: ['name'],
        },
        {
          fields: ['gmt_modified'],
        }
      ]
    });


  ModuleUnpublished.findByName = async (name) => {
    return await ModuleUnpublished.findOne({
      where: {
        name: name
      }
    });
  }
  ModuleUnpublished.save = async (name, pkg) => {
    var row = await ModuleUnpublished.findOne({
      where: {
        name: name
      }
    });
    if (row) {
      row.package = pkg;
      if (row.changed()) {
        row = await row.save(['package']);
      }
      return row;
    }

    row = ModuleUnpublished.build({
      name: name,
      package: pkg,
    });
    return await row.save();
  }


  return ModuleUnpublished;
};
