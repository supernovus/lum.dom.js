/**
 * Tests for the `@lumjs/dom#isListener` method.
 */
const Test = require('@lumjs/tests-dom');

const plan = 3;

const t = Test.getTest({module, plan});

t.isListener(function() {}, 'function');
t.isListener(()=>true, 'arrow function');
t.isListener({handleEvent(){}}, 'object with handleEvent()');

t.done();
