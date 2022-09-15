/**
 * Tests for parsing HTML/XML strings.
 */
const Test = require('@lumjs/tests-dom');
const PT = require('../lib/util').PARSE_TYPE;

const plan = 20;

const t = Test.getTest({module, plan});

const dom = t.dom;
const win = dom.window;

// Valid as an HTML fragment, or an XML document.
const FRAG_1 = '<section id="main"><p>Hello world</p></section>';

let html = dom.parse(FRAG_1);
t.isDocument(html, 'parse() returns Document');
t.is(html.documentElement.tagName, 'HTML', 'parse() document is <html/>');
t.is(html.body.childElementCount, 1, 'parse() single body');
t.is(html.body.firstElementChild.id, 'main', 'parse() parsed element in body');
t.is(html.head.childElementCount, 0, 'parse() head is empty');

let xml = dom.parse(FRAG_1, 'text/xml');
t.isDocument(xml, 'parse(:xml) returns document');
t.is(xml.documentElement.tagName, 'section', 'parse(:xml) document is parsed element');

html = dom.html(FRAG_1);
t.isElement(html, 'html() returns Element');
t.is(html.tagName, 'SECTION', 'html() .tagName');
t.is(html.id, 'main', 'html() .id');

xml = dom.xml(FRAG_1);
t.isElement(xml, 'xml() returns Element');
t.is(xml.tagName, 'section', 'xml() .tagName');
t.is(xml.id, 'main', 'xml() .id');

// Valid as an HTML fragment, but NOT an XML document.
const FRAG_2 = '<p id="first">Hello</p><p id="second">world</p>';

html = dom.html(FRAG_2);
t.isHTMLCollection(html, 'html(:multiRoot) returns HTMLCollection');
t.is(html.length, 2, 'html(:multiRoot) .length');

xml = dom.xml(FRAG_2);
t.isElement(xml, 'xml(:multiRoot) returns Element');
t.is(xml.tagName, 'parsererror', 'xml(:multiRoot) is a `parsererror`');

// One last test fragment.
const FRAG_3 = '<html><head><title>Test</title></head><body><br/><br/><br/></body></html>';

html = dom.parse(FRAG_3);
t.is(html.head.childElementCount, 1, 'parse(:htmlDoc) head count');
t.is(html.body.childElementCount, 3, 'parse(:htmlDoc) body count');

html = dom.html(FRAG_3);
t.is(html.tagName, 'HTML', 'html(:htmlDoc) returns <html/>');

t.done();
