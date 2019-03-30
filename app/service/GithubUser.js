const row = {
  name: 'bitores',
  email: '88@qq.com',
  login: 'bitores'
}

function isAdmin() {
  return true;
}

export default class {
  /**
   * Auth user with login name and password
   * @param  {String} login    login name
   * @param  {String} password login password
   * @return {User}
   */
  async auth(login, password) {
    return {
      login: row.name,
      email: row.email,
      name: row.name,
      html_url: 'http://cnpmjs.org/~' + row.name,
      avatar_url: '',
      im_url: '',
      site_admin: isAdmin(row.name),
      scopes: this.ctx.$config.scopes,
    }
  }
  /**
   * Get user by login name
   * @param  {String} login  login name
   * @return {User}
   */
  async get(login) {
    return {
      login: row.name,
      email: row.email,
      name: row.name,
      html_url: 'http://cnpmjs.org/~' + row.name,
      avatar_url: '',
      im_url: '',
      site_admin: isAdmin(row.name),
      scopes: this.ctx.$config.scopes,
    }
  }
  /**
   * List users
   * @param  {Array<String>} logins  login names
   * @return {Array<User>}
   */
  async list(logins) {
    return [{
      login: row.name,
      email: row.email,
      name: row.name,
      html_url: 'http://cnpmjs.org/~' + row.name,
      avatar_url: '',
      im_url: '',
      site_admin: isAdmin(row.name),
      scopes: this.ctx.$config.scopes,
    }]
  }
  /**
   * Search users
   * @param  {String} query  query keyword
   * @param  {Object} [options] optional query params
   *  - {Number} limit match users count, default is `20`
   * @return {Array<User>}
   */
  async search(query, options) {
    return [{
      login: row.name,
      email: row.email,
      name: row.name,
      html_url: 'http://cnpmjs.org/~' + row.name,
      avatar_url: '',
      im_url: '',
      site_admin: isAdmin(row.name),
      scopes: this.ctx.$config.scopes,
    }]
  }
}