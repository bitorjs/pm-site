export default async (ctx) => {
  if (ctx.query.private_only) {
    const tasks = [];
    for (let i = 0; i < ctx.$config.scopes.length; i++) {
      const scope = ctx.$config.scopes[i];
      tasks.push(ctx.$service.package.listPrivateModulesByScope(scope));
    }

    if (ctx.$config.privatePackages && ctx.$config.privatePackages.length > 0) {
      tasks.push(ctx.$service.package.listModules(ctx.$config.privatePackages));
    }

    const results = await tasks;
    const names = [];
    for (const rows of results) {
      for (const row of rows) {
        names.push(row.name);
      }
    }
    ctx.body = names;
    return;
  }

  ctx.body = await ctx.$service.package.listAllPublicModuleNames();
};
