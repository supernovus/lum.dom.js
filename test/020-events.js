/**
 * Tests for the `events` module.
 */
const Test = require('@lumjs/tests-dom');

const plan = 1;

const t = Test.getTest({module, plan});

const events = t.dom.events;
t.isa(events, 'object', 'events is an object');

// TODO: write actual tests here.

t.done();
