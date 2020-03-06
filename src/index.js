const Hapi = require('@hapi/hapi');

const init = async () => {

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: 'localhost'
  });

  server.route({
    method: 'POST',
    path: '/',
    handler: (request, h) => {
      const payload = request.payload


      if (!payload) {
        const msg = 'no Pub/Sub message received';
        console.error(`error: ${msg}`);
        return h.response(`Bad Request: ${msg}`).code(400)
      }

      const pubSubMessage = payload.message;

      const name = pubSubMessage.data
        ? Buffer.from(pubSubMessage.data, 'base64')
          .toString()
          .trim()
        : 'World';

      console.log(`Hello ${name}!`);

      return h.response('created').code(204)
    },
    options: {
      auth: false,
      // validate: {
      // payload: {
      //     url: TODO
      // Insert your joi schema here
      //  https://hapi.dev/family/joi/tester/
      // Joi.string().uri({
      //   scheme: [
      //     'http',
      //     'https'
      //    ]
      // })

      // }
      // }
    }

  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};


process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();
