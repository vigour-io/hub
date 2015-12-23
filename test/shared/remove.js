'use strict'

module.exports = function (protocol, key) {
  describe('remove', function () {
    var server, receiver, receiver2 //eslint-disable-line
    var Promise = require('bluebird')
    var util = require('./util')
    var setup

    it('can create and connect to multiple hubs', function (done) {
      setup = util.setup({
        protocol: protocol,
        key: key,
        receivers: 2,
        log: true
      })
      server = setup.server
      receiver = setup[1]
      receiver2 = setup[2]
      setup.connected.done(function () {
        done()
      })
    })

    it('can set and use any subscriptions on the recievers', function (done) {
      var pattern = {
        shows: {
          $any: {
            title: true
          }
        }
      }
      receiver.subscribe(pattern)
      receiver2.subscribe(pattern)

      Promise.all([
        createPromises(receiver2.get('shows', {})),
        createPromises(server.get('shows', {}))
      ]).done(function () {
        done()
      })

      receiver.set({
        shows: {
          a: { title: 'a' },
          b: { title: 'b' },
          c: { title: 'c' },
          d: { title: 'd' }
        }
      })

      function createPromises (shows) {
        return Promise.all([
          shows.get('a.title', {}).is('a'),
          shows.get('b.title', {}).is('b'),
          shows.get('c.title', {}).is('c'),
          shows.get('d.title', {}).is('d')
        ])
      }
    })


  })
}
