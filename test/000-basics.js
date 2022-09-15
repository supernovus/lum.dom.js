/**
 * A bootstrap test and template for other test sets.
 * We won't write tests for most methods already covered in `tests-dom`.
 */
const Test = require('@lumjs/tests-dom');
//const core = require('@lumjs/core');

const lib = require('../lib');

const plan = 2;

const t = Test.getTest({module, plan});

const dom = lib.new(t.dom.window);

t.isWindow(dom.window, 'dom.window');
t.isDocument(dom.document, 'dom.document');

t.done();
