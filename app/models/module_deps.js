/**
 * Module dependencies.
 */

/*
CREATE TABLE IF NOT EXISTS `module_deps` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
 `gmt_create` datetime NOT NULL COMMENT 'create time',
 `name` varchar(214) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'module name',
 `deps` varchar(214) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'which module depend on this module',
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_name_deps` (`name`,`deps`),
 KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='module deps';
 */
const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  const ModuleDependency = sequelize.define('ModuleDependency', {
    name: {
      type: Sequelize.STRING(214),
      allowNull: false,
      comment: 'module name',
    },
    dependent: {
      field: 'deps',
      type: Sequelize.STRING(100),
      comment: '`name` is depended by `deps`. `deps` == depend => `name`'
    }
  }, {
      tableName: 'module_deps',
      comment: 'module deps',
      // no need update timestamp
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['name', 'deps'],
        },
        {
          fields: ['deps'],
        }
      ]
    });

  return ModuleDependency;
};
