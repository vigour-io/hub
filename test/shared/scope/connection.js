'use strict'
module.exports = function (protocol, key) {
  describe('multiple upstreams, multiple scopes, multiple clients over single connection', function () {
    var Hub = require('../../../lib')
    var getScope = Hub.prototype.getScope
    var a, b, receiverA1, receiverA2
    // servers
    it('can create 2 servers and 2 receivers', function () {
      a = new Hub({ key: 'server_a' })
      b = new Hub({
        key: 'server_b',
        define: {
          getScope (val, event) {
            var scope = getScope.apply(this, arguments)
            scope.set({
              key: 'server_bSCOPE_' + val,
              adapter: {
                [key]: 'scope_connection_server_a',
                scope: val
              }
            })
            return scope
          }
        }
      })

      a.set({
        adapter: {
          id: 'scope_connection_server_a',
          inject: protocol
        }
      })

      b.set({
        adapter: {
          id: 'scope_connection_server_b',
          inject: protocol
        }
      })

      a.adapter.set({ [key]: { server: key === 'mock' ? 'scope_connection_server_a' : 6001 } })
      b.adapter.set({ [key]: { server: key === 'mock' ? 'scope_connection_server_b' : 6002 } })

      // recievers
      receiverA1 = new Hub({ key: 'receiverA1' })
      receiverA2 = new Hub({ key: 'receiverA2' })

      receiverA1.set({
        adapter: {
          id: 'scope_connection_receiver_A1',
          inject: protocol
        }
      })

      receiverA2.set({
        adapter: {
          id: 'scope_connection_receiver_A2',
          inject: protocol
        }
      })
    })

    it('receiverA1 can connect to b, b._scopes.A1 gets connected to a', function (done) {
      receiverA1.adapter.set({
        scope: 'a1',
        mock: 'scope_connection_server_b'
      })
      b.once('new', function (data) {
        this.adapter.mock.connected.once(function () {
          expect(receiverA1.adapter.mock.connected.val).to.equal(true)
          done()
        })
      })
    })

    it('a1 has scope with correct clients object', function () {
      expect(a).to.have.property('_scopes')
        .which.has.property('a1')
        .which.has.property('clients')
        .which.has.property('scope_connection_server_b')
    })

    it('a set a field on scope a1', function () {
      a._scopes.a1.set({
        somefield: true
      })
      expect(receiverA1).to.have.property('somefield')
    })

    it('receiverA2 can connect to b, b._scopes.A2 gets connected to a, shares connection', function (done) {
      b.once('new', function (data) {
        this.adapter.mock.connected.once(function () {
          expect(receiverA2.adapter.mock.connected.val).to.equal(true)
          done()
        })
      })
      receiverA2.adapter.set({
        scope: 'a2',
        mock: 'scope_connection_server_b'
      })
    })

    it('a2 has scope with correct clients object', function () {
      expect(a).to.have.property('_scopes')
        .which.has.property('a2')
        .which.has.property('clients')
        .which.has.property('scope_connection_server_b')
    })

    it('a set a field on scope a2', function () {
      a._scopes.a2.set({
        anotherfield: true
      })
      expect(receiverA2).to.have.property('anotherfield')
      expect(receiverA1).to.not.have.property('anotherfield')
    })
  })
}
