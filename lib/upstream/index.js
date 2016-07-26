'use strict'
const vstamp = require('vigour-stamp')
const client = require('./client')
const send = require('./send')
const connect = require('./connect')
const queue = require('./queue')

exports.properties = {
  upstream: true,
  reconnect: true,
  queue: true,
  url: {
    sync: false,
    on: {
      data: {
        connect (data, stamp) {
          const hub = this.cParent()
          const val = this.compute()
          if (hub.upstream) {
            if (hub.reconnect) {
              clearTimeout(hub.reconnect)
              hub.reconnect = null
            }
            hub.upstream.blockReconnect = true
            hub.upstream.close()
          }
          hub.set({ connected: false }, stamp)
          if (val) { connect(hub, val, 50) }
        }
      }
    }
  },
  connected: {
    sync: false,
    on: {
      data: {
        queue (val, stamp) {
          const hub = this.cParent()
          if (this.compute() === true && hub.upstream) {
            client(hub, stamp)
            send(hub)
          }
        }
      }
    }
  }
}

exports.define = {
  sendUp (state, val, stamp) {
    if (val !== void 0) {
      if (!this.connected.compute()) {
        queue(this, state, val, stamp)
      } else {
        const create = queue(this, state, val, stamp)
        if (create) {
          vstamp.on(stamp, () => send(this))
        }
      }
    }
  }
}
