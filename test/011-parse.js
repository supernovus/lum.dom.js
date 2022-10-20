/**
 * Tests for parsing HTML/XML strings.
 */
const Test = require('@lumjs/tests-dom');
const Util = require('../lib/util');
const PT = Util.PARSE_TYPE;
const HM = Util.HTML_MODE;

const plan = 29;

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

html = dom.html(FRAG_1, HM.AUTO_BODY);
t.isElement(html, 'html(:AUTO_BODY) returns Element');
t.is(html.tagName, 'SECTION', 'html(:AUTO_BODY) .tagName');

html = dom.html(FRAG_1, HM.BODY);
t.isElement(html, 'html(:BODY) returns Element');
t.is(html.tagName, 'BODY', 'html(:BODY) .tagName');

html = dom.html(FRAG_1, HM.HTML);
t.isElement(html, 'html(:HTML) returns Element');
t.is(html.tagName, 'HTML', 'html(:HTML) .tagName');

html = dom.html(FRAG_1, HM.DOC);
t.isDocument(html, 'html(:DOC) returns Document');

xml = dom.xml(FRAG_1);
t.isElement(xml, 'xml() returns Element');
t.is(xml.tagName, 'section', 'xml() .tagName');
t.is(xml.id, 'main', 'xml() .id');

// Valid as an HTML fragment, but NOT an XML document.
const FRAG_2 = '<p id="first">Hello</p><p id="second">world</p>';

html = dom.html(FRAG_2);
t.isHTMLCollection(html, 'html(:multiRoot) returns HTMLCollection');
t.is(html.length, 2, 'html(:multiRoot) .length');

html = dom.html(FRAG_2, HM.AUTO_BODY);
t.isElement(html, 'html(:multiRoot, :AUTO_BODY) returns Element');
t.is(html.tagName, 'BODY', 'html(:multiRoot, :AUTO_BODY) .tagName');

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
