export default async (ctx) => {
  const name = ctx.params.name || ctx.params[0];
  const dependents = await ctx.$service.package.listDependents(name);

  ctx.body = {
    dependents: dependents,
  };
};
