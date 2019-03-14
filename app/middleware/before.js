export default async (ctx, next) => {
  console.log("before middleware")
  next()
}