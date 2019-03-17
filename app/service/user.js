
import {
  Service
} from 'bitorjs-decorators';
import config from '../../config/app.config';
import { User } from '../models';
import DefaultUserService from './default_user_service';


if (!config.userService) {
  config.userService = new DefaultUserService();
  config.customUserService = false;
} else {
  config.customUserService = true;
}
config.scopes = config.scopes || [];

function convertUser(user) {
  if (!user) {
    return null;
  }
  user.scopes = user.scopes || [];
  if (user.scopes.length === 0 && config.scopes.length > 0) {
    user.scopes = config.scopes.slice();
  }
  return user;
}
@Service('User')
export default class {
  async auth(login, password) {
    var user = await config.userService.auth(login, password);
    return convertUser(user);
  }

  async get(login) {
    var user = await config.userService.get(login);
    return convertUser(user);
  }

  async list(logins) {
    var users = await config.userService.list(logins);
    return users.map(convertUser);
  }

  async search(query, options) {
    var users = await config.userService.search(query, options);
    return users.map(convertUser);
  }

  async getAndSave(login) {
    if (config.customUserService) {
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
      if (config.customUserService) {
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
