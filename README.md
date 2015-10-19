# Timeful States

Immutable states with timestamps.

## Usage

```javascript
var States = require('timeful-state');

var transitions = {
  // called when 'birth' state is triggered
  'birth': function (fromState, toState) {
    toState.birthday = fromState.time; // birthday is the from states time/date
    toState.age = 0;
  },
  // called when switching from 'birth' to 'dead' state
  'birth:dead': function (fromState, toState, duration) {
    toState.age = duration; // age is the duration between the state switches
    toState.obit = toState.time; // time of death is the to states time/date
  }
};

// create new states container with given transitions and initial state
var states = States(transitions, 'birth');

// create state object with given unique key
var firstState = states.create('first');
var secondState = states.create('second');

secondState.to('dead');

// a state is a function, when called returns the current state data
console.log(secondState().age); // ~0;

setTimeout(function () {
  // add additional state data
  firstState.to('dead', {
    message: 'Time to go.'
  });

  console.log(firstState().age, firstState().message); // > ~100 "Time to go."
}, 100);

// get state by key
console.log(states.get('first')().age); // > 0

// set internal state value
firstState.set('foo', 'bar');
firstState.set({ foo: 'foo', bar: 'bar' });
```
