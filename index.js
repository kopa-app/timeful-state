'use strict';

var iMap = require('immutable').Map;

function States(transitions, initialState) {
  var states = {};

  function State(data) {
    var currentName;
    var current = iMap(data || {}).merge({ time: new Date() });

    function fn() {
      return current.toObject();
    };

    fn.to = function (name, data) {
      if (currentName === name) {
        return;
      }

      var next = current.merge(data || {}, { time: new Date() });
      var duration = next.get('time').getTime() - current.get('time').getTime();

      var transition = (currentName ?
        transitions[currentName + ':' + name] || transitions[name]
        : transitions[name]) || null;

      if (transition && typeof transition === 'function') {
        var nextObj = next.toObject();
        transition(current.toObject(), nextObj, duration);
        next = next.merge(nextObj);
      }

      current = next;
      currentName = name;
    }

    fn.set = function (name, value) {
      if (typeof name === 'string' && name === 'time') {
        return;
      }

      // set single property
      if (typeof name === 'string') {
        current = current.set(name, value);
      } else if (typeof name === 'object') {
        // multiple properties
        var data = {};

        Object.keys(name).forEach(function (key) {
          if (key === 'time') {
            return;
          }

          data[key] = name[key];
        });

        current = current.merge(data);
      }
    };

    if (initialState) {
      fn.to(initialState);
    }

    return fn;
  }

  return {
    create: function (key, data) {
      var state = states[key] = State(data);
      return state;
    },
    get: function (key) {
      return states[key] || null;
    }
  };
}

module.exports = States;
