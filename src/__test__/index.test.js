'use strict';

const server = require('../index')

jest.mock('../callSitespeed')

beforeAll((done) => {
  server.events.on('start', () => {
      done();
  });
});

afterAll((done) => {
  server.events.on('stop', () => {
      done();
  });
  server.stop();
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
