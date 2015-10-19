'use strict';

var expect = require('expect.js');

var States = require('./index');

describe('States', function () {
  it('should create and get states', function () {
    // create new states container with given transitions and initial state
    var states = States({}, 'birth');
    var first = states.create('first');
    var second = states.create('second');

    expect(states.get('first')).to.be(first);
    expect(states.get('second')).to.be(second);
  });

  it('should allow passing initial data', function () {
    var states = States({}, 'birth');
    var first = states.create('first', {
      message: 'first'
    });

    expect(first().message).to.eql('first');
  });

  it('should execute transitions', function (done) {
    var called = [];

    var transitions = {
      'birth': function (fromState, toState) {
        onTransition('birth');
      },
      // called when switching from 'birth' to 'dead' state
      'birth:dead': function (fromState, toState, duration) {
        onTransition('birth:dead');
      },
      // called whenever
      'rebirth': function (fromState, toState, duration) {
        onTransition('rebirth');
      }
    };

    function onTransition(name) {
      called.push(name);

      if (called.length === 3) {
        expect(called).to.eql(['birth', 'birth:dead', 'rebirth']);
        done();
      }
    }

    var states = States(transitions, 'birth');
    var first = states.create('first');

    first.to('dead');
    first.to('rebirth');
  });

  it('should set timestamps', function (done) {
    var called = [];
    var states, first, beforeCreateTime, birthTime, deadTime, rebirthTime;

    var transitions = {
      'birth': function (fromState, toState, duration) {
        birthTime = new Date();
        expect(fromState.time >= beforeCreateTime).to.be(true);
        expect(toState.time <= birthTime).to.be(true);
        expect(duration).to.be(0);
        onTransition('birth');
      },
      // called when switching from 'birth' to 'dead' state
      'birth:dead': function (fromState, toState, duration) {
        deadTime = new Date();
        expect(fromState.time <= birthTime).to.be(true);
        expect(toState.time <= deadTime).to.be(true);
        expect(duration >= 100).to.be(true);
        onTransition('birth:dead');
      },
      // called whenever
      'rebirth': function (fromState, toState, duration) {
        rebirthTime = new Date();
        expect(fromState.time <= deadTime).to.be(true);
        expect(toState.time <= rebirthTime).to.be(true);
        expect(duration >= 100).to.be(true);
        onTransition('rebirth');
      }
    };

    function onTransition(name) {
      called.push(name);

      if (called.length === 3) {
        expect(called).to.eql(['birth', 'birth:dead', 'rebirth']);
        done();
      }
    }

    states = States(transitions, 'birth');
    beforeCreateTime = new Date();
    first = states.create('first');

    setTimeout(function () {
      first.to('dead');

      setTimeout(function () {
        first.to('rebirth');
      }, 100);
    }, 100);
  });

  it('should allow passing data with transition', function () {
    var states = States({}, 'birth');
    var first = states.create('first');

    first.to('death', {
      message: 'Time to go.'
    });
    expect(first().message).to.be('Time to go.');

    first.to('deathAgain', {
      message: 'Time to say goodbye.',
      foo: 'bar'
    });
    expect(first().message).to.be('Time to say goodbye.');
    expect(first().foo).to.be('bar');
  });

  it('should set values within transitions', function () {
    var transitions = {
      // called when 'birth' state is triggered
      'birth': function (fromState, toState) {
        toState.age = 0;
        toState.birthday = fromState.time;
        toState.life = 1;
      },
      // called when switching from 'birth' to 'dead' state
      'birth:dead': function (fromState, toState, duration) {
        toState.age = duration;
        toState.obit = toState.time;
      },
      // called whenever
      'rebirth': function (fromState, toState, duration) {
        toState.birthday = fromState.time;
        toState.age = 0;
        toState.life++;
      }
    };

    var states = States(transitions, 'birth');

    // create state object with given unique key
    var first = states.create('first');
    var second = states.create('second');

    expect(first().age).to.be(0);
    expect(first().life).to.be(1);
    expect(second().age).to.be(0);
    expect(second().life).to.be(1);

    second.to('dead');
    expect(second().age >= 0).to.be(true);

    setTimeout(function () {
      expect(first().age >= 100).to.be(true);
      expect(first().life).to.be(1);

      setTimeout(function () {
        first.to('rebirth');

        expect(first().age >= 200).to.be(true);
        expect(first().life).to.be(2);
      }, 100);
    }, 100);
  });

  it('should set single or multiple values', function () {
    var states = States({});
    var first = states.create('first');
    first.set('foo', 'bar');
    expect(first().foo).to.be('bar');

    first.set({
      foo: 'foo',
      bar: 'bar'
    });

    expect(first().foo).to.be('foo');
    expect(first().bar).to.be('bar');
  });
});
