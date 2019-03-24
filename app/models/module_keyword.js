/**
 * Module dependencies.
 */

/*
CREATE TABLE IF NOT EXISTS `module_keyword` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
 `gmt_create` datetime NOT NULL COMMENT 'create time',
 `keyword` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'keyword',
 `name` varchar(214) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'module name',
 `description` longtext COMMENT 'module description',
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_keyword_module_name` (`keyword`,`name`),
 KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='module keyword';
 */
const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  const ModuleKeyword = sequelize.define('ModuleKeyword', {
    keyword: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'keyword',
    },
    name: {
      type: Sequelize.STRING(214),
      allowNull: false,
      comment: 'module name',
    },
    description: {
      type: Sequelize.LONGTEXT,
      allowNull: true,
      comment: 'module description',
    }
  }, {
      tableName: 'module_keyword',
      comment: 'module keyword',
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['keyword', 'name'],
        },
        {
          fields: ['name'],
        }
      ],
      classMethods: {

      }
    });

  ModuleKeyword.findByKeywordAndName = async (keyword, name) => {
    return await ModuleKeyword.findOne({
      where: {
        keyword: keyword,
        name: name
      }
    });
  }
  return ModuleKeyword;
};
