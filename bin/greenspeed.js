#!/usr/bin/env node

/*eslint no-console: 0*/

'use strict';

const log = require("debug")("gd:greenspeed:cli");
const callSiteSpeed = require("../src/callSitespeed");
const Bossy = require('@hapi/bossy');

const apiServer = require("../src/index");
const webUI = require("../src/web-ui");
// const wholeStackServer = require("../src/whole-stack");

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
  a: {
    description: 'Run greenspeed as a full stack',
    alias: 'whole-stack',
    type: 'boolean'
  },
  w: {
    description: 'Runs a server with a web UI',
    alias: 'webUI',
    type: 'boolean'
  }

};

const args = Bossy.parse(definition);

if (args instanceof Error) {
    console.error(args.message);
    return;
}
if (args.h) {
    console.log(Bossy.usage(definition, 'greenspeed [<url>]'));
    return;
}


let showUsage = true;

for (let val of Object.values(args)) {
  if (val) {
    showUsage = false;
  }
}

if (showUsage) {
  console.log(Bossy.usage(definition, 'greenspeed [<url>]'))
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

async function runWebUI(args) {
  webUI.start();
}

async function runServer(args) {
  apiServer.start();
}

async function main(args) {

  if (args.u) {
    return await runGreenSpeedCLI(args)
  }
  if (args.a) {
    return await runServer(args)
  }
  if (args.w) {
    return await runWebUI(args)
  }
}
main(args);
