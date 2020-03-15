#!/usr/bin/env node

/*eslint no-console: 0*/

'use strict';

const callSiteSpeed = require("../src/callSitespeed");

console.log("starting")

async function main() {
  // pull out domain

  process.exitCode = 1;
  try {
    const result = await callSiteSpeed("https://google.com");
    console.log("WORKED")
    process.exitCode = 0

  } catch (e) {
    console.log("FAILED", e)
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}
main();