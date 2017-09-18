/* global describe, it, beforeEach */
var expect = require('chai').expect
var sinon = require('sinon')
var decache = require('decache')
var asyncMethods = require('./index')
var resolvePromise
var rejectPromise

function fetch() {
  return new Promise(function(resolve, reject) {
    resolvePromise = resolve
    rejectPromise = reject
  })
}

describe('vue-async-methods custom options', function() {
  var vm
  var onError
  beforeEach(function() {
    decache('vue')
    var Vue = require('vue')
    onError = sinon.stub()
    Vue.use(asyncMethods, {
      onError: onError
    })
    
    vm = new Vue({
      asyncMethods: {
        fetch: fetch
      }
    })
  })
  
  describe('when it fail', function() {
    var error = new Error('fail')
    beforeEach(function() {
      var call = vm.fetch.execute(1, 2, 3)
      rejectPromise(error)
      return call.catch(function () {})
    })
    
    it('calls the global error handler', function() {
      sinon.assert.calledOnce(onError)
      sinon.assert.calledWithMatch(onError, error, sinon.match.object, 'fetch', [1, 2, 3])
    })
  })

})

describe('vue-async-methods default options', function() {
  var vm
  beforeEach(function() {
    decache('vue')
    var Vue = require('vue')
    Vue.use(asyncMethods)
    vm = new Vue({
      asyncMethods: {
        fetch: fetch
      }
    })
  })

  it('creates the method object on the vm', function() {
    expect(vm.fetch.execute).to.be.a('function')
  })

  it('exposes the initial state', function() {
    expect(vm.fetch.promise).to.equal(null)
    expect(vm.fetch.isCalled).to.equal(false)
    expect(vm.fetch.isPending).to.equal(false)
    expect(vm.fetch.isResolved).to.equal(false)
    expect(vm.fetch.isRejected).to.equal(false)
    expect(vm.fetch.resolvedWith).to.equal(null)
    expect(vm.fetch.resolvedWithSomething).to.equal(false)
    expect(vm.fetch.resolvedWithEmpty).to.equal(false)
    expect(vm.fetch.rejectedWith).to.equal(null)
  })

  describe('after called', function() {
    var call
    beforeEach(function() {
      call = vm.fetch.execute()
    })

    it('is called', function() {
      expect(vm.fetch.promise).to.equal(call)
      expect(vm.fetch.isCalled).to.equal(true)
      expect(vm.fetch.isPending).to.equal(true)
      expect(vm.fetch.isResolved).to.equal(false)
      expect(vm.fetch.isRejected).to.equal(false)
      expect(vm.fetch.resolvedWith).to.equal(null)
      expect(vm.fetch.resolvedWithSomething).to.equal(false)
      expect(vm.fetch.resolvedWithEmpty).to.equal(false)
      expect(vm.fetch.rejectedWith).to.equal(null)
    })

    describe('when resolved with empty', function() {
      var resolveResult = {}
      beforeEach(function() {
        resolvePromise(resolveResult)
        return call
      })

      it('reflects status', function() {
        expect(vm.fetch.promise).to.equal(call)
        expect(vm.fetch.isCalled).to.equal(true)
        expect(vm.fetch.isPending).to.equal(false)
        expect(vm.fetch.isResolved).to.equal(true)
        expect(vm.fetch.isRejected).to.equal(false)
        expect(vm.fetch.resolvedWith).to.equal(resolveResult)
        expect(vm.fetch.resolvedWithSomething).to.equal(false)
        expect(vm.fetch.resolvedWithEmpty).to.equal(true)
        expect(vm.fetch.rejectedWith).to.equal(null)
      })
    })
    
    describe('when resolved with something', function() {
      var resolveResult = {
        foo: false
      }
      beforeEach(function() {
        resolvePromise(resolveResult)
        return call
      })

      it('reflects status', function() {
        expect(vm.fetch.promise).to.equal(call)
        expect(vm.fetch.isCalled).to.equal(true)
        expect(vm.fetch.isPending).to.equal(false)
        expect(vm.fetch.isResolved).to.equal(true)
        expect(vm.fetch.isRejected).to.equal(false)
        expect(vm.fetch.resolvedWith).to.equal(resolveResult)
        expect(vm.fetch.resolvedWithSomething).to.equal(true)
        expect(vm.fetch.resolvedWithEmpty).to.equal(false)
        expect(vm.fetch.rejectedWith).to.equal(null)
      })
    })
    
    describe('when resolved with empty array', function() {
      var resolveResult = []
      beforeEach(function() {
        resolvePromise(resolveResult)
        return call
      })

      it('reflects status', function() {
        expect(vm.fetch.promise).to.equal(call)
        expect(vm.fetch.isCalled).to.equal(true)
        expect(vm.fetch.isPending).to.equal(false)
        expect(vm.fetch.isResolved).to.equal(true)
        expect(vm.fetch.isRejected).to.equal(false)
        expect(vm.fetch.resolvedWith).to.equal(resolveResult)
        expect(vm.fetch.resolvedWithSomething).to.equal(false)
        expect(vm.fetch.resolvedWithEmpty).to.equal(true)
        expect(vm.fetch.rejectedWith).to.equal(null)
      })
    })
    
    describe('when resolved with array', function() {
      var resolveResult = [1]
      beforeEach(function() {
        resolvePromise(resolveResult)
        return call
      })

      it('reflects status', function() {
        expect(vm.fetch.promise).to.equal(call)
        expect(vm.fetch.isCalled).to.equal(true)
        expect(vm.fetch.isPending).to.equal(false)
        expect(vm.fetch.isResolved).to.equal(true)
        expect(vm.fetch.isRejected).to.equal(false)
        expect(vm.fetch.resolvedWith).to.equal(resolveResult)
        expect(vm.fetch.resolvedWithSomething).to.equal(true)
        expect(vm.fetch.resolvedWithEmpty).to.equal(false)
        expect(vm.fetch.rejectedWith).to.equal(null)
      })
    })
    
    describe('when rejected', function() {
      var rejectResult = new Error('msg')
      beforeEach(function() {
        rejectPromise(rejectResult)
        return call.catch(function () {}) // expect fail
      })

      it('reflects status', function() {
        expect(vm.fetch.promise).to.equal(call)
        expect(vm.fetch.isCalled).to.equal(true)
        expect(vm.fetch.isPending).to.equal(false)
        expect(vm.fetch.isResolved).to.equal(false)
        expect(vm.fetch.isRejected).to.equal(true)
        expect(vm.fetch.resolvedWith).to.equal(null)
        expect(vm.fetch.resolvedWithSomething).to.equal(false)
        expect(vm.fetch.resolvedWithEmpty).to.equal(false)
        expect(vm.fetch.rejectedWith).to.equal(rejectResult)
      })
    })
  })
})
