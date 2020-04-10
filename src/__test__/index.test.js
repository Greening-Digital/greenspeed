'use strict';

const { init, start } = require('../index');


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

//  Column Name            | Data Type | References | Comments                                                |
// | ---------------------- | --------- | ---------- | ------------------------------------------------------- |
// | id                     | integer   |            | Primary key                                             |
// | requester_email        | text      |            | The email of the requester, where results are sent      |
// | url                    | uri       |            | The requested URL                                       |
// | sitespeed_requested_at | datetime  |            | The timestamp of when the request was sent to sitespeed |
// | sitespeed_response_at  | datetime  |            | The timestamp of when the request was sent to sitespeed |
// | sitespeed_status       |           |            |                                                         |
// | result_location        | uri       |            | The location of the results                             |
// | inserted_at            | datetime  |            | The timestamp the request was made                      |
// | updated_at             | datetime  |            | The timestamp the request was updated                   |
