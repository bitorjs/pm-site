import gravatar from 'gravatar';
import config from '../../config/app.config';
import Models from '../models';
import { isAdmin } from '../lib/common';

const { User } = Models;


export default class {
  /**
 * Auth user with login name and password
 * @param  {String} login    login name
 * @param  {String} password login password
 * @return {User}
 */
  async auth(login, password) {
    var row = await User.auth(login, password);
    if (!row) {
      return null;
    }
    return convertToUser(row);
  }

  /**
   * Get user by login name
   * @param  {String} login  login name
   * @return {User}
   */
  async get(login) {
    var row = await User.findByName(login);
    console.log(row)
    if (!row) {
      return null;
    }
    return convertToUser(row);
  }

  /**
   * List users
   * @param  {Array<String>} logins  login names
   * @return {Array<User>}
   */
  async list(logins) {
    var rows = await User.listByNames(logins);
    var users = [];
    rows.forEach(function (row) {
      users.push(convertToUser(row));
    });
    return users;
  }

  /**
   * Search users
   * @param  {String} query  query keyword
   * @param  {Object} [options] optional query params
   *  - {Number} limit match users count, default is `20`
   * @return {Array<User>}
   */
  async search(query, options) {
    options = options || {};
    options.limit = parseInt(options.limit);
    if (!options.limit || options.limit < 0) {
      options.limit = 20;
    }

    var rows = await User.search(query, options);
    var users = [];
    rows.forEach(function (row) {
      users.push(convertToUser(row));
    });
    return users;
  }

}


function convertToUser(row) {
  var user = {
    login: row.name,
    email: row.email,
    name: row.name,
    html_url: 'http://cnpmjs.org/~' + row.name,
    avatar_url: '',
    im_url: '',
    site_admin: isAdmin(row.name),
    scopes: config.scopes,
  };
  if (row.json) {
    var data = row.json;
    if (data.login) {
      // custom user
      user = data;
    } else {
      // npm user
      if (data.avatar) {
        user.avatar_url = data.avatar;
      }
      if (data.fullname) {
        user.name = data.fullname;
      }
      if (data.homepage) {
        user.html_url = data.homepage;
      }
      if (data.twitter) {
        user.im_url = 'https://twitter.com/' + data.twitter;
      }
    }
  }
  if (!user.avatar_url) {
    user.avatar_url = gravatar.url(user.email, { s: '50', d: 'retro' }, true);
  }
  return user;
}