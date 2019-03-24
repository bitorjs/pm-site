
import config from '../../config/app.config';
import sequelize from '../common/sequelize';

var _ModuleAbbreviated = config.enableAbbreviatedMetadata ? require('./module_abbreviated')(sequelize) : null;
var _PackageReadme = config.enableAbbreviatedMetadata ? require('./package_readme')(sequelize) : null;

export default {
  sequelize: sequelize,
  Module: require('./module')(sequelize),
  ModuleLog: require('./module_log')(sequelize),
  ModuleStar: require('./module_star')(sequelize),
  ModuleKeyword: require('./module_keyword')(sequelize),
  ModuleDependency: require('./module_deps')(sequelize),
  ModuleMaintainer: require('./module_maintainer')(sequelize),
  ModuleUnpublished: require('./module_unpublished')(sequelize),
  NpmModuleMaintainer: require('./npm_module_maintainer')(sequelize),

  Tag: require('./tag')(sequelize),
  User: require('./user')(sequelize),
  Total: require('./total')(sequelize),
  DownloadTotal: require('./download_total')(sequelize),

  query: function* (sql, args) {
    var options = { replacements: args };
    var data = yield this.sequelize.query(sql, options);
    if (/select /i.test(sql)) {
      return data[0];
    }
    return data[1];
  },
  queryOne: function* (sql, args) {
    var rows = yield this.query(sql, args);
    return rows && rows[0];
  },

  get ModuleAbbreviated() {
    if (!config.enableAbbreviatedMetadata) {
      return null;
    }
    if (!_ModuleAbbreviated) {
      _ModuleAbbreviated = require('./module_abbreviated')(sequelize);
    }
    return _ModuleAbbreviated;
  },

  get PackageReadme() {
    if (!config.enableAbbreviatedMetadata) {
      return null;
    }
    if (!_PackageReadme) {
      _PackageReadme = require('./package_readme')(sequelize);
    }
    return _PackageReadme;
  },
};
