export default app => {
  app.on('error', (err, ctx) => {

    console.log('.....error...', err)
  });
}