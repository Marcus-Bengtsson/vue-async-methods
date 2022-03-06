/* global describe, it, beforeEach */
const expect = require('chai').expect
const sinon = require('sinon')
const decache = require('decache')
const asyncMethods = require('./index')
let resolvePromise
let rejectPromise

function fetch() {
  return new Promise(function(resolve, reject) {
    resolvePromise = resolve
    rejectPromise = reject
  })
}

describe('vue-async-methods custom options', function() {
  let vm
  let onError
  let Vue
  beforeEach(function() {
    decache('vue')
    Vue = require('vue')
    onError = sinon.stub()
    Vue.use(asyncMethods, {
      createComputed: true,
      onError: onError
    })

    vm = new Vue({
      asyncMethods: {
        fetchArticle: fetch
      }
    })
  })

  it('creates computeds based on prefix', function() {
    expect(vm.article).to.equal(null)
  })

  it('does not create computed if only prefix', function() {
    function create() {
      vm = new Vue({
        asyncMethods: {
          fetch: fetch
        }
      })
    }

    expect(create).to.throw(/Computed name for method fetch is empty/)
  })

  describe('direct call', function() {
    const article = {}
    beforeEach(function() {
      const call = vm.fetchArticle()
      resolvePromise(article)
      return call
    })

    it('updates the computed', function() {
      expect(vm.article).to.equal(article)
    })
  })

  describe('when it succeds', function() {
    const article = {}
    beforeEach(function() {
      const call = vm.fetchArticle()
      resolvePromise(article)
      return call
    })

    it('updates the computed', function() {
      expect(vm.article).to.equal(article)
    })
  })

  describe('when it fail', function() {
    const error = new Error('fail')
    beforeEach(function() {
      const call = vm.fetchArticle(1, 2, 3)
      rejectPromise(error)
      return call.catch(function () {})
    })

    it('calls the global error handler', function() {
      sinon.assert.calledOnce(onError)
      sinon.assert.calledWithMatch(onError, error, false, sinon.match.object, 'fetchArticle', [1, 2, 3])
    })
  })
})

describe('vue-async-methods default options', function() {
  let vm
  beforeEach(function() {
    decache('vue')
    const Vue = require('vue')
    Vue.use(asyncMethods)
    vm = new Vue({
      asyncMethods: {
        fetch: fetch
      }
    })
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
    let call
    beforeEach(function() {
      call = vm.fetch()
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
      const resolveResult = {}
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
      const resolveResult = {
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
      const resolveResult = []
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
      const resolveResult = [1]
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
      const rejectResult = new Error('msg')
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
