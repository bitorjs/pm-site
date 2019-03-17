/**
 * Module dependencies.
 */

/*
CREATE TABLE IF NOT EXISTS `module_star` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
 `gmt_create` datetime NOT NULL COMMENT 'create time',
 `user` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'user name',
 `name` varchar(214) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'module name',
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_user_module_name` (`user`,`name`),
 KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='module star';
 */
const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  return sequelize.define('ModuleStar', {
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
      tableName: 'module_star',
      comment: 'module star',
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
      classMethods: {
      }
    });
};
