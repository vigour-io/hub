'use strict'
require('colors-browserify')
var Hub = require('../../lib')
var fs = require('fs')
var Base = require('vigour-js/lib/base')
var Event = require('vigour-js/lib/event')
var Syncable = require('../../lib/syncable/')

var hub = new Hub({ //eslint-disable-line
  adapter: {
    id: 'funtimes2',
    inject: require('../../lib/protocol/websocket'),
    websocket: {
      server: 3032
      // val: 'ws://localhost:3033'
    }
  },
  shows: {
    dummy: {
      title: 'why!'
    }
  }
})

// -- make this a module -- injectable
// make a dir structure!

function safePath (path) {
  var str = ''
  for (var i in path) {
    str = (str ? str + '.' : '') + path[i].replace(/\./g, '_*_')
  }
  return str
}

function parsePath (str) {
  var path = str.split('.')
  for (var i in path) {
    path[i] = path[i].replace(/'_*_/g, '.')
  }
  return path
}

Syncable.prototype.set({
  on: {
    value: {
      save (data, event) {
        if (!this.syncPath || this.syncPath[0] === 'clients' || event.fsevent) {
          return
        }
        if (!(this.val instanceof Base)) {
          let path = __dirname + '/dump/' + safePath(this.syncPath)
          fs.writeFile(path, event.stamp + ':' + this.val, function () {})
        }
      }
    },
    data: {
      save (data, event) {
        if (!this.syncPath || this.syncPath[0] === 'clients' || event.fsevent) {
          return
        }
        if (data === null) {
          let path = safePath(this.syncPath)
          fs.readdir(__dirname + '/dump', function (err, data) {
            if (err) {
              return
            }
            if (data) {
              for (var i in data) {
                if (data[i].indexOf(path) > -1) {
                  fs.unlink(__dirname + '/dump/' + data[i], function () {})
                }
              }
            }
          })
        }
      }
    }
  }
})

fs.readdir(__dirname + '/dump', function (err, data) {
  if (err) {
    return
  }
  if (data) {
    read(0, data)
  }
})

function read (i, queue) {
  if (!queue[i]) {
    return
  }
  fs.readFile(__dirname + '/dump/' + queue[i], function (err, data) {
    if (err || !data) {
      return
    }
    data = data.toString()
    var origin = hub.get(parsePath(queue[i]), {})
    var piv = data.indexOf(':')
    var stamp = data.slice(0, piv - 1)
    var event = new Event(origin, 'data', stamp)
    event.fsevent = true
    event.upstream = true
    origin.set(data.slice(piv + 1), event)
    read(++i, queue)
  })
}

console.log('server 2 start 3032:', hub.adapter.id.rainbow)