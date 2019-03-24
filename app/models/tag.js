/**
 * Module dependencies.
 */

/*
CREATE TABLE IF NOT EXISTS `tag` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
 `gmt_create` datetime NOT NULL COMMENT 'create time',
 `gmt_modified` datetime NOT NULL COMMENT 'modified time',
 `name` varchar(214) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'module name',
 `tag` varchar(30) NOT NULL COMMENT 'tag name',
 `version` varchar(30) NOT NULL COMMENT 'module version',
 `module_id` bigint(20) unsigned NOT NULL COMMENT 'module id',
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_name` (`name`, `tag`),
 KEY `idx_gmt_modified` (`gmt_modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='module tag';
 */
const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  const Tag = sequelize.define('Tag', {
    name: {
      type: Sequelize.STRING(214),
      allowNull: false,
      comment: 'module name',
    },
    tag: {
      type: Sequelize.STRING(30),
      allowNull: false,
      comment: 'tag name',
    },
    version: {
      type: Sequelize.STRING(30),
      allowNull: false,
      comment: 'module version',
    },
    module_id: {
      type: Sequelize.BIGINT(20),
      allowNull: false,
      comment: 'module id'
    }
  }, {
      tableName: 'tag',
      comment: 'module tag',
      indexes: [
        {
          unique: true,
          fields: ['name', 'tag'],
        },
        {
          fields: ['gmt_modified'],
        }
      ],
      classMethods: {

      }
    });

  Tag.findByNameAndTag = async (name, tag) => {
    return await Tag.findOne({ where: { name: name, tag: tag } });
  }
  return Tag;
};
