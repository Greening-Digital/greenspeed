'use strict';

const sitespeed = require('sitespeed.io')

const callSitespeed = async function(url) {
  const urls = [url];
  const name = new URL(urls[0]).host;
  const timestamp = Date.now();

  return await (async function run(){
    try {
      const result = await sitespeed.run({
        urls,
        browsertime: {
          iterations: 1,
          connectivity: {
            profile: 'native',
            downstreamKbps: undefined,
            upstreamKbps: undefined,
            latency: undefined,
            engine: 'external',
          },
          headless: true,
          browser: 'chrome'
        },
        sustainable: {
          enable: true,
          pageViews: 100000,
          useGreenWebHostingAPI: true
        },
        firstParty: true,
        outputFolder: `tmp/${timestamp}-${name}`,
        name: name
      });

      return {
        result,
        path: `${timestamp}-${name}`
      };
    } catch (e) {
      return e;
    }
  })();
};

module.exports = callSitespeed;
