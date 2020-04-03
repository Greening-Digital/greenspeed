#!/usr/bin/env node

/*eslint no-console: 0*/

'use strict';

const log = require("debug")("gd:greenspeed:cli");
const callSiteSpeed = require("../src/callSitespeed");
const Bossy = require('@hapi/bossy');

const { start } = require("../src/index");

const definition = {
  h: {
      description: 'Show help',
      alias: 'help',
      type: 'boolean'
  },
  u: {
      description: 'The url of the page you want to check',
      alias: 'url',
  },
  s: {
    description: 'Run greenspeed as a server, designed to allow triggering of runs though a browser',
    alias: 'server',
    type: 'boolean'
  },
  a: {
    description: 'Runs as an API server, as part of a larger system',
    alias: 'headless',
    type: 'boolean'
  }

};

const args = Bossy.parse(definition);

if (args instanceof Error) {
    console.error(args.message);
    return;
}
if (args.h) {
    console.log(Bossy.usage(definition, 'greenspeed -u <url>'));
    return;
}


let showUsage = true;

for (let val of Object.values(args)) {
  if (val) {
    showUsage = false;
  }
}

if (showUsage) {
  console.log(Bossy.usage(definition, 'greenspeed -u <url>'))
  return
}

if (args._) {
  if (args._.length) {
    args.u = args._[0];
  args.url = args._[0];
  }
}

async function runGreenSpeedCLI(args) {
  // pull out domain
  log(`Running greenspeed with ${args}`)
  process.exitCode = 1;
  try {
    const result = await callSiteSpeed(args.url);
    log("WORKED")
    process.exitCode = 0

  } catch (e) {
    log("FAILED", e)
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

async function runServer(args) {
  start();
}

async function main(args) {

  if (args.u) {
    return await runGreenSpeedCLI(args)
  }
  if (args.s) {
    return await runServer(args)
  }
}
main(args);
