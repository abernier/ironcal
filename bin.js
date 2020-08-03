#!/usr/bin/env node

const {readFileSync} = require('fs')
const {resolve} = require('path')

const conf = require('./conf.js')
const {dayslist, dayslist2ics} = require('./index.js')

var argv = require('minimist')(process.argv.slice(2));
// console.log(argv);

// args values
const ftpt = argv._[0] || 'ft'
const tz = argv._[1] || 'Europe/Paris'
const start = argv.start
const hollidays = argv.hollidays && argv.hollidays.split(',')
const help = argv.help

// --help case
const man = readFileSync(resolve(__dirname, './man.txt'), {encoding: 'utf-8'});
if (help) {
  console.log(man);
  process.exit(0);
}

//
// days -> ics
//

const days = dayslist(ftpt, tz, start, hollidays)
// console.log(JSON.stringify(days, null, 4))

const ics = dayslist2ics(days, ftpt)
console.log(ics)