var uuid = require('vjs/lib/util/uuid')
uuid = uuid.val = uuid.val + '_d_'

var server = require('./server')
// is a server and a client
server.adapter.listens.val = 3032
server.adapter.val = 'ws://localhost:3031'

// require('./dev').randomUpdate(server, 3000)