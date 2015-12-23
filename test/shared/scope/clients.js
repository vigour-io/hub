'use strict'
require('colors-browserify')
module.exports = function (protocol, key) {
  describe('clients', function () {
    var Hub = require('../../../lib')
    var removed = require('../util').removed
    var server, receiver, receiver2
    it('can create a server and 2 clients', function () {
      server = new Hub({
        key: 'clients_s_server'
      })

      receiver = new Hub({
        key: 'clients_s_receiver'
      })

      receiver2 = new Hub({
        key: 'clients_s_receiver2'
      })

      server.set({
        adapter: {
          id: 'clients_s_server',
          inject: protocol,
          [key]: {
            server: key === 'mock' ? 'clients_s_server' : 6001
          }
        }
      })

      receiver.set({
        adapter: {
          id: 'clients_s_receiver',
          inject: protocol,
          [key]: {}
        }
      })

      receiver2.set({
        adapter: {
          id: 'clients_s_receiver2',
          inject: protocol,
          [key]: {}
        }
      })
    })

    it('can connect to the server', function (done) {
      receiver.adapter.set({
        [key]: key === 'mock' ? 'clients_s_server' : 'ws://localhost:6001'
      })
      receiver.adapter[key].once('connect', function () {
        done()
      })
    })

    it('can make a reference to a client', function (done) {
      receiver.set({
        focus: receiver.clients.clients_s_receiver
      })
      server.get('focus', {}).is('clients_s_receiver').then(() => done())
    })

    it('other client connects recieves updates about other clients', function (done) {
      receiver2.adapter.set({
        [key]: key === 'mock' ? 'clients_s_server' : 'ws://localhost:6001'
      })
      receiver2.subscribe({
        clients: {
          $any: {
            x: true
          }
        }
      })

      receiver.subscribe({
        clients: {
          $any: {
            platform: true
          }
        }
      })
      receiver2.adapter[key].once('connect', function () {
        receiver.clients.clients_s_receiver.set({ x: true })
        receiver2.get('clients.clients_s_receiver.x', {}).is(true).then(() => done())
      })
    })

    it('focus gets changed to receiver2, update ends up in receiver', function (done) {
      receiver.subscribe({
        focus: true
      })
      receiver2.set({
        focus: receiver2.clients.clients_s_receiver2
      })
      receiver.get('focus', {}).is('clients_s_receiver2').then(() => done())
    })

    it('receiver2 switches scope, remove from server.clients', function (done) {
      receiver2.adapter.scope.val = 'scoped'
      server.clients.once('property', function (data) {
        if (data.removed) {
          expect(data.removed).to.deep.equal([ 'clients_s_receiver2' ])
          done()
        }
      })
    })
    it('expect focus to be nulled on reciever', function (done) {
      if (receiver.clients.clients_s_receiver2 === null) {
        done()
      } else {
        receiver.clients.clients_s_receiver2.once('remove', function () {
          done()
        })
      }
    })
  })
}
