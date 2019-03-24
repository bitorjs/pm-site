var utility = require('utility');
var utils = require('./utils');

/*
CREATE TABLE IF NOT EXISTS `user` (
 `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
 `gmt_create` datetime NOT NULL COMMENT 'create time',
 `gmt_modified` datetime NOT NULL COMMENT 'modified time',
 `name` varchar(100) NOT NULL COMMENT 'user name',
 `salt` varchar(100) NOT NULL COMMENT 'user salt',
 `password_sha` varchar(100) NOT NULL COMMENT 'user password hash',
 `ip` varchar(64) NOT NULL COMMENT 'user last request ip',
 `roles` varchar(200) NOT NULL DEFAULT '[]' COMMENT 'user roles',
 `rev` varchar(40) NOT NULL COMMENT 'user rev',
 `email` varchar(400) NOT NULL COMMENT 'user email',
 `json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'json details',
 `npm_user` tinyint(1) DEFAULT '0' COMMENT 'user sync from npm or not, 1: true, other: false',
 PRIMARY KEY (`id`),
 UNIQUE KEY `uk_name` (`name`),
 KEY `idx_gmt_modified` (`gmt_modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='user base info';
*/
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
module.exports = function (sequelize) {
  const User = sequelize.define('User', {
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'user name',
    },
    salt: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'user salt',
    },
    password_sha: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'user password hash',
    },
    ip: {
      type: Sequelize.STRING(64),
      allowNull: false,
      comment: 'user last request ip',
    },
    roles: {
      type: Sequelize.STRING(200),
      allowNull: false,
      defaultValue: '[]',
      comment: 'user roles',
    },
    rev: {
      type: Sequelize.STRING(40),
      allowNull: false,
      comment: 'user rev',
    },
    email: {
      type: Sequelize.STRING(400),
      allowNull: false,
      comment: 'user email',
    },
    json: {
      type: Sequelize.LONGTEXT,
      allowNull: true,
      get: utils.JSONGetter('json'),
      set: utils.JSONSetter('json'),
    },
    isNpmUser: {
      field: 'npm_user',
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'user sync from npm or not, 1: true, other: false',
    }
  }, {
      tableName: 'user',
      comment: 'user base info',
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

  // utils
  User.createPasswordSha = function (password, salt) {
    return utility.sha1(password + salt);
  }

  // read
  User.auth = async (name, password) => {
    var user = await User.findByName(name);
    if (user) {
      var sha = User.createPasswordSha(password, user.salt);
      if (user.password_sha !== sha) {
        user = null;
      }
    }
    return user;
  }
  User.findByName = async (name) => {
    return await User.findOne({ where: { name: name } });
  }
  User.listByNames = async (names) => {
    if (!names || names.length === 0) {
      return [];
    }
    return await User.findAll({
      where: {
        name: {
          [Op.in]: names
        }
      }
    });
  }
  User.search = async (query, options) => {
    return await User.findAll({
      where: {
        name: {
          [Op.like]: query + '%'
        }
      },
      limit: options.limit
    });
  }

  // write
  User.saveNpmUser = async (data) => {
    var user = await User.findByName(data.name);
    if (!user) {
      user = User.build({
        isNpmUser: true,
        name: data.name,
        salt: '0',
        password_sha: '0',
        ip: '0',
      });
    }
    user.isNpmUser = true;
    user.json = data;
    user.email = data.email || '';
    user.rev = data._rev || '';
    if (user.changed()) {
      user = await user.save();
    }
    return user;
  }
  User.saveCustomUser = async (data) => {
    var name = data.user.login;
    var user = await User.findByName(name);
    if (!user) {
      user = User.build({
        isNpmUser: false,
        name: name,
      });
    }

    var rev = '1-' + data.user.login;
    var salt = data.salt || '0';
    var passwordSha = data.password_sha || '0';
    var ip = data.ip || '0';

    user.isNpmUser = false;
    user.email = data.user.email;
    user.ip = ip;
    user.json = data.user;
    user.rev = rev;
    user.salt = salt;
    user.password_sha = passwordSha;
    if (user.changed()) {
      user = await user.save();
    }
    return user;
  }

  // add cnpm user
  User.add = async (user) => {
    var roles = user.roles || [];
    try {
      roles = JSON.stringify(roles);
    } catch (e) {
      roles = '[]';
    }
    var rev = '1-' + utility.md5(JSON.stringify(user));

    var row = User.build({
      rev: rev,
      name: user.name,
      email: user.email,
      salt: user.salt,
      password_sha: user.password_sha,
      ip: user.ip,
      roles: roles,
      isNpmUser: false,
    });

    return await row.save();
  }

  User.update = async (user) => {
    var rev = user.rev || user._rev;
    var revNo = Number(rev.split('-', 1));
    if (!revNo) {
      var err = new Error(rev + ' format error');
      err.name = 'RevFormatError';
      err.data = { user: user };
      throw err;
    }
    revNo++;
    var newRev = revNo + '-' + utility.md5(JSON.stringify(user));
    var roles = user.roles || [];
    try {
      roles = JSON.stringify(roles);
    } catch (e) {
      roles = '[]';
    }

    var row = await User.findByName(user.name);
    if (!row) {
      return null;
    }

    row.rev = newRev;
    row.email = user.email;
    row.salt = user.salt;
    row.password_sha = user.password_sha;
    row.ip = user.ip;
    row.roles = roles;
    row.isNpmUser = false;

    return await row.save(['rev', 'email', 'salt', 'password_sha', 'ip', 'roles', 'isNpmUser']);
  }

  return User;
};
