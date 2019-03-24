/*
CREATE TABLE IF NOT EXISTS `package_readme` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
 `gmt_create` datetime NOT NULL COMMENT 'create time',
 `gmt_modified` datetime NOT NULL COMMENT 'modified time',
 `name` varchar(214) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'module name',
 `readme` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'the latest version readme',
 `version` varchar(30) NOT NULL COMMENT 'module version',
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_name` (`name`),
 KEY `idx_gmt_modified` (`gmt_modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='package latest readme';
 */
const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  const PackageReadme = sequelize.define('PackageReadme', {
    name: {
      type: Sequelize.STRING(214),
      allowNull: false,
      comment: 'module name'
    },
    version: {
      type: Sequelize.STRING(30),
      allowNull: false,
      comment: 'module latest version'
    },
    readme: {
      type: Sequelize.LONGTEXT,
      comment: 'latest version readme',
    },
  }, {
      tableName: 'package_readme',
      comment: 'package latest readme',
      indexes: [
        {
          unique: true,
          fields: ['name'],
        },
        {
          fields: ['gmt_modified'],
        },
      ]
    });

  PackageReadme.findByName = async (name) => {
    return await PackageReadme.findOne({
      where: { name: name },
    });
  }

  return PackageReadme;
};
