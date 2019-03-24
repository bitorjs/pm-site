/**
 * Module dependencies.
 */

/*
CREATE TABLE IF NOT EXISTS `module_maintainer` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
 `gmt_create` datetime NOT NULL COMMENT 'create time',
 `user` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'user name',
 `name` varchar(214) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'module name',
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_user_module_name` (`user`,`name`),
 KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='private module maintainers';
 */
const Sequelize = require('sequelize');
const mountClass = require('./parts/_module_maintainer_class_methods');
module.exports = function (sequelize) {
  const ModuleMaintainer = sequelize.define('ModuleMaintainer', {
    user: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'user name'
    },
    name: {
      type: Sequelize.STRING(214),
      allowNull: false,
      comment: 'module name',
    }
  }, {
      tableName: 'module_maintainer',
      comment: 'private module maintainers',
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['user', 'name'],
        },
        {
          fields: ['name'],
        }
      ],
    });

  mountClass(ModuleMaintainer)
  return ModuleMaintainer;
};
