'use strict'

describe('client', function () {
  var Hub = require('../../lib')
  var mock = require('../../lib/protocol/mock')
  var server = new Hub({
    key: 'server_client',
    adapter: {
      id: 'server_client',
      inject: mock
    }
  })
  var receiver = new Hub({
    key: 'receiver_client',
    adapter: {
      id: 'receiver_client',
      inject: mock,
      mock: {}
    }
  })
  var receiver2 = new Hub({
    key: 'receiver_client_2',
    adapter: {
      id: 'receiver_client_2',
      inject: mock,
      mock: {}
    }
  })
  server.set({
    adapter: {
      mock: {
        server: 'server_client'
      }
    }
  })

  it('receiver can connect to server', function (done) {
    receiver.adapter.mock.once('connect', function () {
      expect(server)
        .to.have.property('clients')
        .which.has.property('receiver_client')
        .which.has.property('platform')
      done()
    })
    receiver.set({
      adapter: {
        mock: 'server_client'
      }
    })
  })

  it('reciever has ip', function () {
    expect(receiver)
      .to.have.property('clients')
      .which.has.property('receiver_client')
      .which.has.property('ip')
  })

  it('receiver2 can connect to server', function (done) {
    receiver2.adapter.mock.once('connect', function () {
      expect(server)
        .to.have.property('clients')
        .which.has.property('receiver_client_2')
        .which.has.property('platform')
      done()
    })
    receiver2.set({
      adapter: {
        mock: 'server_client'
      }
    })
  })

  it('reciever2 has ip', function () {
    expect(receiver2)
      .to.have.property('clients')
      .which.has.property('receiver_client_2')
      .which.has.property('ip')
  })

  // sending info back is weird
  it('reciever has correct client meta data about receiver2', function () {
    expect(receiver)
      .to.have.property('clients')
      .which.has.property('receiver_client_2')
      .which.has.property('platform')
  })
})