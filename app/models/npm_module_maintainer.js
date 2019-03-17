/**
 * Module dependencies.
 */

/*
CREATE TABLE IF NOT EXISTS `npm_module_maintainer` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
 `gmt_create` datetime NOT NULL COMMENT 'create time',
 `user` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'user name',
 `name` varchar(214) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'module name',
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_user_module_name` (`user`,`name`),
 KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='npm original module maintainers';
 */
const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  return sequelize.define('NpmModuleMaintainer', {
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
      tableName: 'npm_module_maintainer',
      comment: 'npm original module maintainers',
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
      classMethods: require('./parts/_module_maintainer_class_methods'),
    });
};
