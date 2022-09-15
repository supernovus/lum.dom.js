/**
 * Tests for the `query` module.
 * 
 * Most of the query functionality is tested in `tests-dom`.
 * This will just be tests of features not tested there.
 */
 const Test = require('@lumjs/tests-dom');

 const plan = 1;
 
 const t = Test.getTest({module, plan});
 
 const q = t.dom.query;
 t.isa(q, 'object', 'query is an object');
 
 // TODO: write actual tests here.
 
 t.done();
 