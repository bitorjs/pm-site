
import {
  Service
} from 'bitorjs-decorators';
import Models from '../models';
const { User } = Models;

@Service('User')
export default class {
  constructor(ctx) {
    if (!ctx.$config.userService || ctx.$config.userService === 'default') {
      ctx.$config.userService = ctx.$service.DefaultUserService;
      ctx.$config.customUserService = false;
    } else if (ctx.$config.userService === 'github') {
      ctx.$config.userService = ctx.$service.GithubUser;
      ctx.$config.customUserService = false;
      console
    } else {
      ctx.$config.customUserService = true;
    }
    ctx.$config.scopes = ctx.$config.scopes || [];

    this.convertUser = function (user) {
      if (!user) {
        return null;
      }
      user.scopes = user.scopes || [];
      if (user.scopes.length === 0 && ctx.config.scopes.length > 0) {
        user.scopes = ctx.config.scopes.slice();
      }
      return user;
    }
  }

  async auth(login, password) {
    var user = await this.ctx.$config.userService.auth(login, password);
    return this.convertUser(user);
  }

  async get(login) {
    var user = await this.ctx.$config.userService.get(login);
    return this.convertUser(user);
  }

  async list(logins) {
    var users = await this.ctx.$config.userService.list(logins);
    return users.map(this.convertUser);
  }

  async search(query, options) {
    var users = await this.ctx.$config.userService.search(query, options);
    return users.map(this.convertUser);
  }

  async getAndSave(login) {
    if (this.ctx.$config.customUserService) {
      var user = await this.get(login);
      if (user) {
        var data = {
          user: user
        };
        await User.saveCustomUser(data);
      }
    }
    return await User.findByName(login);
  }

  async authAndSave(login, password) {
    var user = await this.auth(login, password);
    if (user) {
      if (this.ctx.$config.customUserService) {
        // make sure sync user meta to cnpm database
        var data = {
          rev: Date.now() + '-' + user.login,
          user: user
        };
        await User.saveCustomUser(data);
      }
    }
    return user;
  }

  async add(user) {
    return await User.add(user);
  }

  async update(user) {
    return await User.update(user);
  }


}
