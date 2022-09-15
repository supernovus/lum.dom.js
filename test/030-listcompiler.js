/**
 * Tests for the `listcompiler` module.
 */
 const Test = require('@lumjs/tests-dom');

 const plan = 1;
 
 const t = Test.getTest({module, plan});
 
 const lc = t.dom.listCompiler;
 t.isa(lc, 'object', 'listCompiler is an object');
 
 // TODO: write actual tests here.
 
 t.done();
 