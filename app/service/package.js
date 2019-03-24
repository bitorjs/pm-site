import semver from 'semver';
import models from '../models';
var Tag = models.Tag;
var User = models.User;
var Module = models.Module;
var ModuleStar = models.ModuleStar;
var ModuleKeyword = models.ModuleKeyword;
var PrivateModuleMaintainer = models.ModuleMaintainer;
var ModuleDependency = models.ModuleDependency;
var ModuleUnpublished = models.ModuleUnpublished;
var NpmModuleMaintainer = models.NpmModuleMaintainer;

var isPrivateScopedPackage = require('../lib/common').isPrivateScopedPackage;



// module
var _parseRow = function (row) {
  if (row.package.indexOf('%7B%22') === 0) {
    // now store package will encodeURIComponent() after JSON.stringify
    row.package = decodeURIComponent(row.package);
  }
  row.package = JSON.parse(row.package);
  if (typeof row.publish_time === 'string') {
    // pg bigint is string
    row.publish_time = Number(row.publish_time);
  }
};

// module:read
var parseRow = function (row) {
  if (row && row.package) {
    try {
      _parseRow(row);
    } catch (e) {
      console.warn('parse package error: %s, id: %s version: %s, error: %s', row.name, row.id, row.version, e);
    }
  }
}


function stringifyPackage(pkg) {
  return encodeURIComponent(JSON.stringify(pkg));
}

export default class {

  constructor(ctx) {
    ctx.$config.privatePackages = ctx.$config.privatePackages || [];
  }

  isPrivatePackage(scope) {
    if (isPrivateScopedPackage(scope)) {
      return true;
    }

    if (this.ctx.$config.privatePackages.indexOf(scope) >= 0) {
      return true;
    }
    return false;
  }





  async getModuleById(id) {
    var row = await Module.findById(Number(id));
    parseRow(row);
    return row;
  }

  async getModule(name, version) {
    var row = await Module.findByNameAndVersion(name, version);
    parseRow(row);
    return row;
  }

  async getModuleByTag(name, tag) {
    var tag = await Tag.findByNameAndTag(name, tag);
    if (!tag) {
      return null;
    }
    return await this.getModule(tag.name, tag.version);
  }

  async getModuleByRange(name, range) {
    var rows = await this.listModulesByName(name, ['id', 'version']);
    var versionMap = {};
    var versions = rows.map(function (row) {
      versionMap[row.version] = row;
      return row.version;
    }).filter(function (version) {
      return semver.valid(version);
    });

    var version = semver.maxSatisfying(versions, range);
    if (!versionMap[version]) {
      return null;
    }

    var id = versionMap[version].id;
    return await this.getModuleById(id);
  }

  async getLatestModule(name) {
    return await this.getModuleByTag(name, 'latest');
  }

  // module:list

  async listPrivateModulesByScope(scope) {
    var tags = await Tag.findAll({
      where: {
        tag: 'latest',
        name: {
          like: scope + '/%'
        }
      }
    });

    if (tags.length === 0) {
      return [];
    }

    var ids = tags.map(function (tag) {
      return tag.module_id;
    });

    return await Module.findAll({
      where: {
        id: ids
      }
    });
  }

  async listModules(names) {
    if (names.length === 0) {
      return [];
    }

    // fetch latest module tags
    var tags = await Tag.findAll({
      where: {
        name: names,
        tag: 'latest'
      }
    });
    if (tags.length === 0) {
      return [];
    }

    var ids = tags.map(function (tag) {
      return tag.module_id;
    });

    var rows = await Module.findAll({
      where: {
        id: ids
      },
      attributes: [
        'name', 'description', 'version',
      ]
    });
    return rows;
  }

  async listModulesByUser(username) {
    var names = await this.listModuleNamesByUser(username);
    return await this.listModules(names);
  }

  async listModuleNamesByUser(username) {
    var sql = 'SELECT distinct(name) AS name FROM module WHERE author=?;';
    var rows = await models.query(sql, [username]);
    var map = {};
    var names = rows.map(function (r) {
      return r.name;
    });

    // find from npm module maintainer table
    var moduleNames = await NpmModuleMaintainer.listModuleNamesByUser(username);
    moduleNames.forEach(function (name) {
      if (!map[name]) {
        names.push(name);
      }
    });

    // find from private module maintainer table
    moduleNames = await PrivateModuleMaintainer.listModuleNamesByUser(username);
    moduleNames.forEach(function (name) {
      if (!map[name]) {
        names.push(name);
      }
    });
    return names;
  }

  async listPublicModulesByUser(username) {
    var names = await this.listPublicModuleNamesByUser(username);
    return await this.listModules(names);
  }

  // return user all public package names
  async listPublicModuleNamesByUser(username) {
    var sql = 'SELECT distinct(name) AS name FROM module WHERE author=?;';
    var rows = await models.query(sql, [username]);
    var map = {};
    var names = rows.map(function (r) {
      return r.name;
    }).filter(function (name) {
      var matched = name[0] !== '@';
      if (matched) {
        map[name] = 1;
      }
      return matched;
    });

    // find from npm module maintainer table
    var moduleNames = await NpmModuleMaintainer.listModuleNamesByUser(username);
    moduleNames.forEach(function (name) {
      if (!map[name]) {
        names.push(name);
      }
    });
    return names;
  }

  // start must be a date or timestamp
  async listPublicModuleNamesSince(start) {
    if (!(start instanceof Date)) {
      start = new Date(Number(start));
    }
    var rows = await Tag.findAll({
      attributes: ['name'],
      where: {
        gmt_modified: {
          gt: start
        }
      },
    });
    var names = {};
    for (var i = 0; i < rows.length; i++) {
      names[rows[i].name] = 1;
    }
    return Object.keys(names);
  }

  async listAllPublicModuleNames() {
    var sql = 'SELECT DISTINCT(name) AS name FROM tag ORDER BY name';
    var rows = await models.query(sql);
    return rows.filter(function (row) {
      return !this.isPrivatePackage(row.name);
    }).map(function (row) {
      return row.name;
    });
  }

  async listModulesByName(moduleName, attributes) {

    var mods = await Module.findAll({
      where: {
        name: moduleName
      },
      order: [['id', 'DESC']],
      attributes,
    });
    for (var mod of mods) {
      parseRow(mod);
    }

    return mods;
  }

  async getModuleLastModified(name) {
    var mod = await Module.findOne({
      where: {
        name: name,
      },
      order: [
        ['gmt_modified', 'DESC']
      ],
      attributes: ['gmt_modified']
    });
    return mod && mod.gmt_modified || null;
  }

  // module:update
  async saveModule(mod) {
    var keywords = mod.package.keywords;
    if (typeof keywords === 'string') {
      keywords = [keywords];
    }
    var pkg = stringifyPackage(mod.package);
    var description = mod.package && mod.package.description || '';
    var dist = mod.package.dist || {};
    // dist.tarball = '';
    // dist.shasum = '';
    // dist.size = 0;
    var publish_time = mod.publish_time || Date.now();
    var item = await Module.findByNameAndVersion(mod.name, mod.version);
    if (!item) {
      item = Module.build({
        name: mod.name,
        version: mod.version
      });
    }
    item.publish_time = publish_time;
    // meaning first maintainer, more maintainers please check module_maintainer table
    item.author = mod.author;
    item.package = pkg;
    item.dist_tarball = dist.tarball;
    item.dist_shasum = dist.shasum;
    item.dist_size = dist.size;
    item.description = description;

    if (item.changed()) {
      item = await item.save();
    }
    var result = {
      id: item.id,
      gmt_modified: item.gmt_modified
    };

    if (!Array.isArray(keywords)) {
      return result;
    }

    var words = [];
    for (var i = 0; i < keywords.length; i++) {
      var w = keywords[i];
      if (typeof w === 'string') {
        w = w.trim();
        if (w) {
          words.push(w);
        }
      }
    }

    if (words.length > 0) {
      // add keywords
      await this.addKeywords(mod.name, description, words);
    }

    return result;
  }

  async listModuleAbbreviatedsByName(name) {
    if (!config.enableAbbreviatedMetadata) {
      return [];
    }

    var rows = await models.ModuleAbbreviated.findAll({
      where: {
        name: name,
      },
      order: [['id', 'DESC']],
    });

    for (var row of rows) {
      row.package = JSON.parse(row.package);
      if (row.publish_time && typeof row.publish_time === 'string') {
        // pg bigint is string
        row.publish_time = Number(row.publish_time);
      }
    }
    return rows;
  }

  // https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md#abbreviated-version-object
  async saveModuleAbbreviated(mod) {
    var pkg = JSON.stringify({
      name: mod.package.name,
      version: mod.package.version,
      deprecated: mod.package.deprecated,
      dependencies: mod.package.dependencies,
      optionalDependencies: mod.package.optionalDependencies,
      devDependencies: mod.package.devDependencies,
      bundleDependencies: mod.package.bundleDependencies,
      peerDependencies: mod.package.peerDependencies,
      bin: mod.package.bin,
      directories: mod.package.directories,
      dist: mod.package.dist,
      engines: mod.package.engines,
      _hasShrinkwrap: mod.package._hasShrinkwrap,
      _publish_on_cnpm: mod.package._publish_on_cnpm,
    });
    var publish_time = mod.publish_time || Date.now();
    var item = await models.ModuleAbbreviated.findByNameAndVersion(mod.name, mod.version);
    if (!item) {
      item = models.ModuleAbbreviated.build({
        name: mod.name,
        version: mod.version,
      });
    }
    item.publish_time = publish_time;
    item.package = pkg;

    if (item.changed()) {
      item = await item.save();
    }
    var result = {
      id: item.id,
      gmt_modified: item.gmt_modified,
    };

    return result;
  }

  async updateModulePackage(id, pkg) {
    var mod = await Module.findById(Number(id));
    if (!mod) {
      // not exists
      return null;
    }
    mod.package = stringifyPackage(pkg);
    return await mod.save(['package']);
  }

  async updateModulePackageFields(id, fields) {
    var mod = await this.getModuleById(id);
    if (!mod) {
      return null;
    }
    var pkg = mod.package || {};
    for (var k in fields) {
      pkg[k] = fields[k];
    }
    return await this.updateModulePackage(id, pkg);
  }

  async updateModuleAbbreviatedPackage(item) {
    // item => { id, name, version, _hasShrinkwrap }
    var mod = await models.ModuleAbbreviated.findByNameAndVersion(item.name, item.version);
    if (!mod) {
      return null;
    }
    var pkg = JSON.parse(mod.package);
    for (var key in item) {
      if (key === 'name' || key === 'version' || key === 'id') {
        continue;
      }
      pkg[key] = item[key];
    }
    mod.package = JSON.stringify(pkg);

    return await mod.save(['package']);
  }

  async updateModuleReadme(id, readme) {
    var mod = await this.getModuleById(id);
    if (!mod) {
      return null;
    }
    var pkg = mod.package || {};
    pkg.readme = readme;
    return await this.updateModulePackage(id, pkg);
  }

  async updateModuleDescription(id, description) {
    var mod = await this.getModuleById(id);
    if (!mod) {
      return null;
    }
    mod.description = description;
    // also need to update package.description
    var pkg = mod.package || {};
    pkg.description = description;
    mod.package = stringifyPackage(pkg);

    return await mod.save(['description', 'package']);
  }

  async updateModuleLastModified(name) {
    var row = await Module.findOne({
      where: { name: name },
      order: [['gmt_modified', 'DESC']],
    });
    if (!row) {
      return null;
    }
    // gmt_modified is readonly, we must use setDataValue
    row.setDataValue('gmt_modified', new Date());
    return await row.save();
  }

  // try to return latest version readme
  async getPackageReadme(name, onlyPackageReadme) {
    if (config.enableAbbreviatedMetadata) {
      var row = await models.PackageReadme.findByName(name);
      if (row) {
        return {
          version: row.version,
          readme: row.readme,
        };
      }
      if (onlyPackageReadme) {
        return;
      }
    }

    var mod = await this.getLatestModule(name);
    if (mod) {
      return {
        version: mod.package.version,
        readme: mod.package.readme,
      };
    }
  }

  async savePackageReadme(name, readme, latestVersion) {
    var item = await models.PackageReadme.findOne({ where: { name: name } });
    if (!item) {
      item = models.PackageReadme.build({
        name: name,
      });
    }
    item.readme = readme;
    item.version = latestVersion;
    return await item.save();
  }

  async removeModulesByName(name) {
    await Module.destroy({
      where: {
        name: name,
      },
    });
    if (config.enableAbbreviatedMetadata) {
      await models.ModuleAbbreviated.destroy({
        where: {
          name: name,
        },
      });
    }
  }

  async removeModulesByNameAndVersions(name, versions) {
    await Module.destroy({
      where: {
        name: name,
        version: versions,
      }
    });
    if (config.enableAbbreviatedMetadata) {
      await models.ModuleAbbreviated.destroy({
        where: {
          name: name,
          version: versions,
        },
      });
    }
  }

  // tags
  async addModuleTag(name, tag, version) {
    var mod = await this.getModule(name, version);
    if (!mod) {
      return null;
    }

    var row = await Tag.findByNameAndTag(name, tag);
    if (!row) {
      row = Tag.build({
        name: name,
        tag: tag
      });
    }
    row.module_id = mod.id;
    row.version = version;
    if (row.changed()) {
      return await row.save();
    }
    return row;
  }

  async getModuleTag(name, tag) {
    return await Tag.findByNameAndTag(name, tag);
  }

  async removeModuleTags(name) {
    return await Tag.destroy({ where: { name: name } });
  }

  async removeModuleTagsByIds(ids) {
    return await Tag.destroy({ where: { id: ids } });
  }

  async removeModuleTagsByNames(moduleName, tagNames) {
    return await Tag.destroy({
      where: {
        name: moduleName,
        tag: tagNames
      }
    });
  }

  async listModuleTags(name) {
    return await Tag.findAll({ where: { name: name } });
  }

  // dependencies

  // name => dependency
  async addDependency(name, dependency) {
    var row = await ModuleDependency.findOne({
      where: {
        name: dependency,
        dependent: name
      }
    });
    if (row) {
      return row;
    }
    return await ModuleDependency.build({
      name: dependency,
      dependent: name
    }).save();
  }

  async addDependencies(name, dependencies) {
    var tasks = [];
    for (var i = 0; i < dependencies.length; i++) {
      tasks.push(this.addDependency(name, dependencies[i]));
    }
    return await tasks;
  }

  async listDependents(dependency) {
    var items = await ModuleDependency.findAll({
      where: {
        name: dependency
      }
    });
    return items.map(function (item) {
      return item.dependent;
    });
  }

  // maintainers
  async listPublicModuleMaintainers(name) {
    return await NpmModuleMaintainer.listMaintainers(name);
  }

  async addPublicModuleMaintainer(name, user) {
    return await NpmModuleMaintainer.addMaintainer(name, user);
  }

  async removePublicModuleMaintainer(name, user) {
    return await NpmModuleMaintainer.removeMaintainers(name, user);
  }

  // only can add to cnpm maintainer table
  async addPrivateModuleMaintainers(name, usernames) {
    return await PrivateModuleMaintainer.addMaintainers(name, usernames);
  }

  async updatePrivateModuleMaintainers(name, usernames) {
    var result = await PrivateModuleMaintainer.updateMaintainers(name, usernames);
    if (result.add.length > 0 || result.remove.length > 0) {
      await this.updateModuleLastModified(name);
    }
    return result;
  }

  async getMaintainerModel(name) {
    return this.isPrivatePackage(name) ? PrivateModuleMaintainer : NpmModuleMaintainer;
  }

  async listMaintainers(name) {

    var mod = await this.getMaintainerModel(name);
    var usernames = await mod.listMaintainers(name);

    if (usernames.length === 0) {
      return usernames;
    }
    var users = await User.listByNames(usernames);

    return users.map(function (user) {
      return {
        name: user.name,
        email: user.email
      };
    });
  }

  async listMaintainerNamesOnly(name) {
    var mod = await this.getMaintainerModel(name);
    return await mod.listMaintainers(name);
  }

  async removeAllMaintainers(name) {
    var rs = [];
    rs.push(await PrivateModuleMaintainer.removeAllMaintainers(name));
    rs.push(await NpmModuleMaintainer.removeAllMaintainers(name))
    return rs;
  }

  async authMaintainer(packageName, username) {
    var mod = await this.getMaintainerModel(packageName);
    var maintainers = await mod.listMaintainers(packageName);
    var latestMod = await this.getLatestModule(packageName);
    if (maintainers.length === 0) {
      // if not found maintainers, try to get from latest module package info
      var ms = latestMod && latestMod.package && latestMod.package.maintainers;
      if (ms && ms.length > 0) {
        maintainers = ms.map(function (user) {
          return user.name;
        });
      }
    }

    var isMaintainer = false;
    if (latestMod && !latestMod.package._publish_on_cnpm) {
      // no one can update public package maintainers
      // public package only sync from source npm registry
      isMaintainer = false;
    } else if (maintainers.length === 0) {
      // no maintainers, meaning this module is free for everyone
      isMaintainer = true;
    } else if (maintainers.indexOf(username) >= 0) {
      isMaintainer = true;
    }

    return {
      isMaintainer: isMaintainer,
      maintainers: maintainers
    }
  }

  async isMaintainer(name, username) {
    var result = await this.authMaintainer(name, username);
    return result.isMaintainer;
  }

  // module keywords

  async addKeyword(data) {
    var item = await ModuleKeyword.findByKeywordAndName(data.keyword, data.name);
    if (!item) {
      item = ModuleKeyword.build(data);
    }
    item.description = data.description;
    if (item.changed()) {
      // make sure object will change, otherwise will cause empty sql error
      // @see https://github.com/cnpm/cnpmjs.org/issues/533
      return await item.save();
    }
    return item;
  }

  async addKeywords(name, description, keywords) {
    var tasks = [];
    keywords.forEach(function (keyword) {
      tasks.push(this.addKeyword({
        name: name,
        keyword: keyword,
        description: description
      }));
    });
    return await tasks;
  }

  // search
  async search(word, options) {
    options = options || {};
    var limit = options.limit || 100;
    word = word.replace(/^%/, ''); //ignore prefix %

    // search flows:
    // 1. prefix search by name
    // 2. like search by name
    // 3. keyword equal search
    var ids = {};

    var sql = 'SELECT module_id FROM tag WHERE LOWER(name) LIKE LOWER(?) AND tag=\'latest\' \
    ORDER BY name LIMIT ?;';
    var rows = await models.query(sql, [word + '%', limit]);
    for (var i = 0; i < rows.length; i++) {
      ids[rows[i].module_id] = 1;
    }

    if (rows.length < 20) {
      rows = await models.query(sql, ['%' + word + '%', limit]);
      for (var i = 0; i < rows.length; i++) {
        ids[rows[i].module_id] = 1;
      }
    }

    var keywordRows = await ModuleKeyword.findAll({
      attributes: ['name', 'description'],
      where: {
        keyword: word
      },
      limit: limit,
      order: [['id', 'DESC']]
    });

    var data = {
      keywordMatchs: keywordRows,
      searchMatchs: []
    };

    ids = Object.keys(ids);
    if (ids.length > 0) {
      data.searchMatchs = await Module.findAll({
        attributes: ['name', 'description'],
        where: {
          id: ids
        },
        order: 'name'
      });
    }

    return data;
  }

  // module star

  async addStar(name, user) {
    var row = await ModuleStar.findOne({
      where: {
        name: name,
        user: user
      }
    });
    if (row) {
      return row;
    }

    row = ModuleStar.build({
      name: name,
      user: user
    });
    return await row.save();
  }

  async removeStar(name, user) {
    return await ModuleStar.destroy({
      where: {
        name: name,
        user: user
      }
    });
  }

  async listStarUserNames(moduleName) {
    var rows = await ModuleStar.findAll({
      where: {
        name: moduleName
      }
    });
    return rows.map(function (row) {
      return row.user;
    });
  }

  async listUserStarModuleNames(user) {
    var rows = await ModuleStar.findAll({
      where: {
        user: user
      }
    });
    return rows.map(function (row) {
      return row.name;
    });
  }

  // unpublish info
  async saveUnpublishedModule(name, pkg) {
    return await ModuleUnpublished.save(name, pkg);
  }

  async getUnpublishedModule(name) {
    return await ModuleUnpublished.findByName(name);
  }



}