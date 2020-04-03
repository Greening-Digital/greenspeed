'use strict';

const { init, start } = require('../webui');

jest.mock('../callSitespeed');

describe("API Server", () => {

  let server;

  beforeEach(async () => {
    server = await init();
  });

  afterEach(async () => {
    await server.stop();
  });

  test('GET request returns failure', async () => {

    const options = {
      method: 'GET',
      url: '/'
    };
    const data = await server.inject(options);
    expect(data.statusCode).toBe(404);
  });

  test('POST request with no payload returns failure', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        url: null
      }
    };
    const data = await server.inject(options);
    expect(data.statusCode).toBe(400);
    expect(data.payload).toBe('Bad Request: no URL received');
  });

  test('POST request with incorrect URL returns failure', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        url: 'badurl'
      }
    };
    const data = await server.inject(options);
    expect(data.statusCode).toBe(400);
    expect(data.payload).toBe('Bad Request: bad URL received');
  });

  test('POST request with correct URL returns success', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        url: 'http://example.com'
      }
    };

    const data = await server.inject(options);
    expect(data.statusCode).toBe(204);
    expect(data.payload).toBe('');
  });

})
describe("WebUI Server", () => {

  let server;

  beforeEach(async () => {
    server = await init();
  });

  afterEach(async () => {
    await server.stop();
  });


  test.only("GET / - serves a static page for submissions", async () => {
    const options = {
      method: 'GET',
      url: '/'
    };
    const data = await server.inject(options);
    expect(data.statusCode).toBe(200);
  })

  test.todo("Submitting a site, takes you to a waiting page for the results")

  test.todo("Submitting a site, saves the site, and pending of the run")

  test.todo("Waiting page for the results are updated after its greenspeed run has completed")
})

