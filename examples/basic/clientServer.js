'use strict'
var isNode = require('vigour-js/lib/util/is/node')
var uuid = require('vigour-js/lib/util/uuid')
uuid = uuid.val = uuid.val + (isNode ? '_node_c_server' : '_browser_c_server')
var hub = require('./client')
hub.key = 'duplex_b'
setTimeout(() => hub.adapter.val = 3031, 1000)
require('./dev').startRepl()
require('./dev').randomUpdate(hub, 0)

var request = require('request')
