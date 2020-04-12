describe("WebUI Server", () => {

  const { init, start } = require('../web-ui');
  const knexfile = require('../../knexfile');

  let server;

  beforeEach(async () => {
    options = {
      db: {
        knex: knexfile.development
      }
    }
    server = await init(options);
  });

  afterEach(async () => {
    await server.stop();
  });


  test("GET / - serves a static page for submissions", async () => {
    const options = {
      method: 'GET',
      url: '/'
    };
    const data = await server.inject(options);
    expect(data.statusCode).toBe(200);
  })
})