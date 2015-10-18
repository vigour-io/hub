'use strict'
var isNode = require('vjs/lib/util/is/node')
var uuid = String(require('vjs/lib/util/uuid').val)
var ADDED = '    added:'
var REMOVED = '    removed:'
var UPDATE = 'incoming '
var UPDATESELF = 'self     '
var UPSTREAM = 'upstream  '
var DOWNSTREAM = 'downstream'

if (isNode) {
  require('colors')
  var lines = process.stdout.getWindowSize()[1]
  for (var i = 0; i < lines; i++) {
    console.log('\r\n')
  }
  UPDATE = UPDATE.green
  UPDATESELF = UPDATESELF.grey
  UPSTREAM = UPSTREAM.magenta
  DOWNSTREAM = DOWNSTREAM.cyan
}

var datacnt = 0
exports.data = function (data, event) {
  // if(!isNode) console.clear()
  datacnt++
  var isSelf = typeof event.stamp !== 'string' || event.stamp.indexOf(uuid) === 0
  var isUpstream = event.upstream
  console.log('   ', cnt,
    this.path.join(' -> '),
    isNode ? uuid.green.bold : uuid,
    isSelf ? UPDATESELF : UPDATE,
    isUpstream ? UPSTREAM : isSelf ? '          ' : DOWNSTREAM,
    event.stamp
  )
}

var cnt = 0
var time
function startPerf () {
  time = Date.now()
  setInterval(function () {
    var sec = (Date.now() - time) / 1000
    console.log('   ', ~~(cnt / sec), 'message/sec')
  }, 25000)
}

exports.performance = function (data, event) {
  if (!time) {
    startPerf()
  }
  cnt++
}

exports.clients = function logClients (data, event) {
  console.log(
    '\n',
    (isNode ? uuid.green.bold : uuid),
    'clients'
  )
  if (data) {
    if (data.added) {
      console.log((isNode ? ADDED.green : ADDED), data.added)
    }
    if (data.removed) {
      console.log((isNode ? REMOVED.red : REMOVED), data.removed)
    }
  }
  var client = this.parent.adapter.client && this.parent.adapter.client.val
  if (client) {
    console.log('    hasClient:', true)
  }
  var arr = this.map((property, key) => key)
  var str = '[ '
  for (let i in arr) {
    str += ((i == 0 ? '' : ', ') +
    (arr[i] === client ? (isNode ? arr[i].green.bold : '>>>' + arr[i] + '<<<') : arr[i]))
  }
  str += ' ]'
  console.log('    clients:', str)
}

// var timestamp = require('monotonic-timestamp')
var updatecnt = 0
exports.randomUpdate = function randUpdate (hub, amount) {
  if (amount === void 0) {
    amount = 3000
  }
  for (let i = 0 ; i < 1; i++) {
    hub.set({
      val: uuid + ' ' + (updatecnt++)
      // field: uuid + ' ' + ~~(Math.random() * 99999) this will break it allready!
    })
  }
  setTimeout(randUpdate, ~~(Math.random() * amount), hub, amount)
}
