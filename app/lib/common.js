import crypto from 'crypto';
import path from 'path';
import util from 'util';
import utility from 'utility';

const config = global.context.$config;
exports.ensurePasswordSalt = function (user, body) {
  if (!user.password_sha && body.password) {
    // create password_sha on server
    user.salt = crypto.randomBytes(30).toString('hex');
    user.password_sha = utility.sha1(body.password + user.salt);
  }
};


exports.getTarballFilepath = function (filename) {
  // ensure download file path unique
  // TODO: not only .tgz, and also other extname
  var name = filename.replace(/\.tgz$/, '.' + crypto.randomBytes(16).toString('hex') + '.tgz');
  return path.join(config.uploadDir, name);
};

exports.getCDNKey = function (name, filename) {
  // if name is scope package name, need to auto fix filename as a scope package file name
  // e.g.: @scope/foo, filename: foo-1.0.0.tgz => filename: @scope/foo-1.0.0.tgz
  if (name[0] === '@' && filename[0] !== '@') {
    filename = name.split('/')[0] + '/' + filename;
  }
  return '/' + name + '/-/' + filename;
};

exports.setDownloadURL = function (pkg, ctx, host) {
  if (pkg.dist) {
    host = host || config.registryHost || ctx.host;
    pkg.dist.tarball = util.format('%s://%s/%s/download/%s-%s.tgz',
      ctx.protocol,
      host, pkg.name, pkg.name, pkg.version);
    if (ctx.querystring) {
      var backupUrl = pkg.dist.tarball;
      pkg.dist.tarball += '?' + ctx.querystring + '&other_urls=' + encodeURIComponent(backupUrl);
    }
  }
};

exports.isAdmin = function (username) {
  return typeof config.admins[username] === 'string';
};

exports.isMaintainer = function (user, maintainers) {
  if (user.isAdmin) {
    return true;
  }

  var username = user.name;
  maintainers = maintainers || [];
  var match = maintainers.filter(function (item) {
    return item.name === username;
  });

  return match.length > 0;
};

exports.isLocalModule = function (mods) {
  for (var i = 0; i < mods.length; i++) {
    var r = mods[i];
    if (r.package && r.package._publish_on_cnpm) {
      return true;
    }
  }
  return false;
};

exports.isPrivateScopedPackage = function (name) {
  if (name[0] !== '@') {
    return false;
  }
  return config.scopes.indexOf(name.split('/')[0]) >= 0;
};
