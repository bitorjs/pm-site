
export default async (ctx) => {
  const username = ctx.params.user;
  const packages = await ctx.$service.package.listModulesByUser(username);

  ctx.body = {
    user: {
      name: username,
    },
    packages: packages,
  };
};
