/**
 * Tests for the `extend` module.
 */
 const Test = require('@lumjs/tests-dom');

 const plan = 1;
 
 const t = Test.getTest({module, plan});
 
 const ext = t.dom.extender;
 t.isa(ext, 'object', 'extender is an object');
 
 // TODO: write actual tests here.
 
 t.done();
 