var ms = require('humanize-ms');
var cleanNpmMetadata = require('normalize-registry-metadata');
var urllib = require('../common/urllib');
var config = require('../../config/app.config');

var USER_AGENT = 'npm_service.cnpmjs.org/' + config.version + ' ' + urllib.USER_AGENT;

const request = async (url, options) => {
  options = options || {};
  options.dataType = options.dataType || 'json';
  options.timeout = options.timeout || 120000;
  options.headers = Object.assign({
    'user-agent': USER_AGENT
  }, options.headers);
  options.gzip = true;
  options.followRedirect = true;
  var registry = options.registry || config.sourceNpmRegistry;
  url = registry + url;
  var r;
  try {
    r = await urllib.request(url, options);
    // https://github.com/npm/registry/issues/87#issuecomment-261450090
    if (options.dataType === 'json' && r.data && config.officialNpmReplicate === registry) {
      cleanNpmMetadata(r.data);
    }
  } catch (err) {
    var statusCode = err.status || -1;
    var data = err.data || '[empty]';
    if (err.name === 'JSONResponseFormatError' && statusCode >= 500) {
      err.name = 'NPMServerError';
      err.status = statusCode;
      err.message = 'Url: ' + url + ', Status ' + statusCode + ', ' + data.toString();
    }
    throw err;
  }
  return r;
}

exports.request = request;

exports.getUser = async (name) => {
  var url = '/-/user/org.couchdb.user:' + name;
  var r = await request(url);
  var data = r.data;
  if (data && !data.name) {
    // 404
    data = null;
  }
  return data;
};

exports.get = async (name) => {
  var r = await request('/' + name);
  var data = r.data;
  if (r.status === 404) {
    data = null;
  }
  return data;
};

exports.fetchUpdatesSince = async (lastSyncTime, timeout) => {
  var lastModified = lastSyncTime - ms('10m');
  var data = await exports.getAllSince(lastModified, timeout);
  var result = {
    lastModified: lastSyncTime,
    names: [],
  };
  if (!data) {
    return result;
  }
  if (Array.isArray(data)) {
    // support https://registry.npmjs.org/-/all/static/today.json
    var maxModified;
    data.forEach(function (pkg) {
      if (pkg.time && pkg.time.modified) {
        var modified = Date.parse(pkg.time.modified);
        if (modified >= lastModified) {
          result.names.push(pkg.name);
        }
        if (!maxModified || modified > maxModified) {
          maxModified = modified;
        }
      } else {
        result.names.push(pkg.name);
      }
    });
    if (maxModified) {
      result.lastModified = maxModified;
    }
  } else {
    // /-/all/since
    if (data._updated) {
      result.lastModified = data._updated;
      delete data._updated;
    }
    result.names = Object.keys(data);
  }
  return result;
};

exports.fetchAllPackagesSince = async (timestamp) => {
  var r = await request('/-/all/static/all.json', {
    registry: 'http://registry.npmjs.org',
    timeout: 600000
  });
  // {"_updated":1441520402174,"0":{"name":"0","dist-tags
  // "time":{"modified":"2014-06-17T06:38:43.495Z"}
  var data = r.data;
  var result = {
    lastModified: timestamp,
    lastModifiedName: null,
    names: [],
  };
  var maxModified;
  for (var key in data) {
    if (key === '_updated') {
      continue;
    }
    var pkg = data[key];
    if (!pkg.time || !pkg.time.modified) {
      continue;
    }
    var modified = Date.parse(pkg.time.modified);
    if (modified >= timestamp) {
      result.names.push(pkg.name);
    }
    if (!maxModified || modified > maxModified) {
      maxModified = modified;
      result.lastModifiedName = pkg.name;
    }
  }
  if (maxModified) {
    result.lastModified = maxModified;
  }
  return result;
};

exports.getAllSince = async (startkey, timeout) => {
  var r = await request('/-/all/since?stale=update_after&startkey=' + startkey, {
    timeout: timeout || 300000
  });
  return r.data;
};

exports.getAllToday = async (timeout) => {
  var r = await request('/-/all/static/today.json', {
    timeout: timeout || 300000
  });
  // data is array: see https://registry.npmjs.org/-/all/static/today.json
  return r.data;
};

exports.getShort = async (timeout) => {
  const registry = config.sourceNpmRegistryIsCNpm ? config.sourceNpmRegistry : 'https://r.cnpmjs.org';
  var r = await request('/-/short', {
    timeout: timeout || 300000,
    // registry.npmjs.org/-/short is 404 now therefore have a fallback
    registry: registry,
  });
  if (r.status !== 200) {
    const data = r.data;
    if (data && data.code && data.message) {
      // { code: 'MethodNotAllowedError', message: 'GET is not allowed' }
      const url = registry + '/-/short';
      const err = new Error(data.message + ', url: ' + url);
      err.name = data.code;
      err.url = url;
      throw err;
    }
  }
  return r.data;
};

exports.getPopular = async (top, timeout) => {
  var r = await request('/-/_view/dependedUpon?group_level=1', {
    registry: config.officialNpmRegistry,
    timeout: timeout || 120000
  });
  if (!r.data || !r.data.rows || !r.data.rows.length) {
    return [];
  }

  // deps number must >= 100
  var rows = r.data.rows.filter(function (a) {
    return a.value >= 100;
  });

  return rows.sort(function (a, b) {
    return b.value - a.value;
  })
    .slice(0, top)
    .map(function (r) {
      return [r.key && r.key[0] && r.key[0].trim(), r.value];
    })
    .filter(function (r) {
      return r[0];
    });
};