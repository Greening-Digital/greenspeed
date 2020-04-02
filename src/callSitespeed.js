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
          browser: 'firefox'
        },
        sustainable: {
          enable: true,
          hosting: true,
          co2PerDomain: true,
          dirtiestResources: true,
          useGreenWebHostingAPI: true,
        },
        outputFolder: `tmp/${name}-${timestamp}`,
        name: name
      });
      return result;
    } catch (e) {
      return e;
    }
  })();
};

module.exports = callSitespeed;
