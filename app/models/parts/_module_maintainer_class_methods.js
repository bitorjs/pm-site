
module.exports = function (className) {

  /**
   * list all module names by user
   * @param {String} user
   */

  className.listModuleNamesByUser = async (user) => {
    var rows = await className.findAll({
      attributrs: ['name'],
      where: {
        user: user
      }
    });
    return rows.map(function (row) {
      return row.name;
    });
  };

  /**
   * list all maintainers of module `name`
   * @param {String} name
   */

  className.listMaintainers = async (name) => {

    var rows = await className.findAll({
      attributrs: ['user'],
      where: {
        name: name
      }
    });

    return rows.map(function (row) {
      return row.user;
    });
  };

  /**
   * add a maintainer for module `name`
   * @param {String} name
   * @param {String} user
   */

  className.addMaintainer = async (name, user) => {
    var row = await className.findOne({
      where: {
        user: user,
        name: name
      }
    });
    if (!row) {
      row = await className.build({
        user: user,
        name: name
      }).save();
    }
    return row;
  };

  /**
   * add maintainers for module `name`
   * @param {String} name
   * @param {Array} users
   */

  className.addMaintainers = async (name, users) => {
    return await users.map(function (user) {
      return className.addMaintainer(name, user);
    }.bind(className));
  };

  /**
   * remove maintainers for module `name`
   * @param {String} name
   * @param {Array} users
   */

  className.removeMaintainers = async (name, users) => {
    // removeMaintainers(name, oneUserName)
    if (typeof users === 'string') {
      users = [users];
    }
    if (users.length === 0) {
      return;
    }
    await className.destroy({
      where: {
        name: name,
        user: users,
      }
    });
  };

  /**
   * remove all maintainers for module `name`
   * @param {String} name
   */

  className.removeAllMaintainers = async (name) => {
    await className.destroy({
      where: {
        name: name
      }
    });
  };

  /**
   * add maintainers to module
   * @param {String} name
   * @param {Array} users
   */

  className.updateMaintainers = async (name, users) => {
    // maintainers should be [username1, username2, ...] format
    // findOne out the exists maintainers
    // then remove all the users not present and add all the left

    if (users.length === 0) {
      return {
        add: [],
        remove: []
      };
    }
    var exists = await className.listMaintainers(name);

    var addUsers = users.filter(function (username) {
      // add user which in `users` but do not in `exists`
      return exists.indexOf(username) === -1;
    });

    var removeUsers = exists.filter(function (username) {
      // remove user which in `exists` by not in `users`
      return users.indexOf(username) === -1;
    });

    await className.addMaintainers(name, addUsers)
    await className.removeMaintainers(name, removeUsers)

    return {
      add: addUsers,
      remove: removeUsers
    };
  };

}
