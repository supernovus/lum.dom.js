const core = require('@lumjs/core');
const {N,F,S,isObj,isNil} = core.types;
const 
{
  NODE_TYPE: NT,
  PARSE_TYPE: PT, 
  VALID_ROOTS,
  HTML_MODE: HM,
} = require('./util');

/**
 * Try to determine if an object is a `Window` using *duck-typing*.
 * 
 * Like any *duck-typing* based test, it's not *guaranteed* to be
 * 100% accurate, but I feel it's good enough for this specific case.
 * 
 * Basically, a real `window` object should have a property called
 * `Window` and the `window` object should be an instance of 
 * its own `Window` property. Very *meta*, welcome to the **DOM**. 
 * 
 * There is also the [instance.isWindow()]{@link module:@lumjs/dom#isWindow}
 * method which is separate from this and much more straightforward, as it's
 * a simple `instanceof` check.
 * 
 * @param {object} obj - The object to test.
 * @returns {boolean} Whether the object seems to be a `Window` instance.
 * 
 * @alias module:@lumjs/dom.isWindow
 */
function isWindow(obj)
{
  return (isObj(obj) 
    && typeof obj.Window === F 
    && obj instanceof obj.Window);
}

/**
 * A DOM container object (holds a collection of node objects.)
 * @typedef {(NodeList|HTMLCollection)} module:@lumjs/dom.Container
 */

/**
 * A `Node` or DOM container a method is targetting.
 * @typedef {(Node|module:@lumjs/dom.Container)} module:@lumjs/dom.Target
 */

/**
 * A `Node` subclass capable of using `querySelector` 
 * @typedef {(NodeList|HTMLCollection)} module:@lumjs/dom.QueryNode
 */

/**
 * A `Node` or node container for use with queries.
 * @typedef {(module:@lumjs/dom.QueryNode|module:@lumjs/dom.Container)} module:@lumjs/dom.QueryTarget
 */

/**
 * The core DOM helper library.
 * 
 * Given a reference to a `Window` object (either from a browser or `jsdom`),
 * this instance provides a bunch of convenience methods.
 * 
 * @property {Window} window - A reference to the top-level Window instance.
 * @property {object} options - Options passed to the constructor.
 * 
 * @property {boolean} [options.autoExtend=false]
 * If `true` the results from `find()`, `get()`, `html()`, and similar methods
 * will be passed through `this.extender.extend()` automatically.
 * 
 * @property {boolean} [options.autoWrap=false]
 * If `true` the results from the same methods mentioned in `autoExtend` will
 * be passed through `this.wrapper.wrap()` automatically.
 * 
 * @property {number} [options.autoAdopt=3]
 * Set if the `html()` and `xml()` methods will import created nodes
 * into the current `document` automatically. This uses bitwise flags:
 * 
 * - `1` => Adopt `Element` results from `html()`.
 * - `2` => Adopt `HTMLCollection` results from `html()`.
 * - `4` => Adopt *valid* results from `xml()`.
 * 
 * @exports module:@lumjs/dom
 */
class LumDOM
{
  /**
   * Build a DOM helper instance.
   * @param {Window} window - The top-level window object.
   * @param {object} [options] Options to customize behaviours.
   * 
   * See the list of `this.options` properties for a list of
   * supported options.
   * 
   * @throws {TypeError} 
   * If the `window` fails the 
   * [isWindow()]{@link module:@lumjs/dom.isWindow} test.
   */
  constructor(window, options={})
  {
    if (isNil(window) && core.context.isWindow)
    { // A shortcut for browser usage.
      window = core.context.root.window;
    }
    if (!isWindow(window))
    {
      throw new TypeError("Invalid `window` object");
    }
    this.window = window;
    this.options = options;
  }

  /**
   * A static shortcut method for building a new instance.
   * 
   * @param {Window} window - The `window` object.
   * @param {object} [options] Options for the constructor.
   * @returns {module:@lumjs/dom}
   * @throws {TypeError} 
   * If the `window` fails the 
   * [isWindow()]{@link module:@lumjs/dom.isWindow} test.
   */
  static new(window, options)
  {
    return new LumDOM(window, options);
  }

  /**
   * Get the top-level `Document` node.
   * @type {Document}
   */
  get document()
  {
    return this.window.document;
  }

  /**
   * Is the passed object a `Window` instance?
   * 
   * This is **not** the same method as the
   * [static isWindow()]{@link module:@lumjs/dom.isWindow},
   * as that method uses *duck-typing*, whereas this method
   * assumes that `this.window` is a valid `Window` instance,
   * and uses a basic `instanceof` check.
   * 
   * @param {object} win - The object we want to test.
   * @returns {boolean}
   */
  isWindow(win)
  {
    return (win instanceof this.window.Window);
  }

  /**
   * Is the passed object a `Node` instance?
   * @param {object} node 
   * @returns {boolean}
   */
  isNode(node)
  {
    return (node instanceof this.window.Node);
  }

  /**
   * Is the passed object an `Element`, `Document`, or `DocumentFragment`.
   * 
   * Uses the `nodeType` property to determine the node type rather than
   * the class name.
   * 
   * @param {object} node 
   * @returns {boolean}
   */
  isQueryNode(node)
  {
    return (this.isNode(node) && VALID_ROOTS.includes(node.nodeType));
  }

  /**
   * Is a node a specific `nodeType`?
   * 
   * The order of the parameters may be reversed.
   * 
   * @param {number} type - The `nodeType` integer value.
   * @param {object} node - The `Node` we are testing.
   * @returns {boolean}
   */
  isNodeType(type, node)
  {
    if (typeof node === N && isObj(type))
    { // The parameters were in reversed order.
      const temp = node;
      node = type;
      type = temp;
    }
    return (this.isNode(node) && node.nodeType === type);
  }

  /**
   * Is it an `Element` node?
   * @param {object} node 
   * @returns {boolean}
   */
  isElement(node) { return this.isNodeType(NT.ELEM, node); }
  
  /**
   * Is it a `Document` node?
   * @param {object} node 
   * @returns {boolean}
   */
  isDocument(node) { return this.isNodeType(NT.DOC, node); }

  /**
   * Is it an `Attribute` node?
   * @param {object} node 
   * @returns {boolean}
   */
  isAttribute(node) { return this.isNodeType(NT.ATTR, node); }

  /**
   * Is it a `Text` node?
   * @param {object} node 
   * @returns {boolean}
   */
  isTextNode(node) { return this.isNodeType(NT.TEXT, node); }

  /**
   * Is it a `NodeList` object?
   * @param {object} list 
   * @returns {boolean}
   */
  isNodeList(list) { return (list instanceof this.window.NodeList); }

  /**
   * Is it an `HTMLCollection` object?
   * @param {object} list 
   * @returns {boolean}
   */
  isHTMLCollection(list) { return (list instanceof this.window.HTMLCollection); }

  /**
   * Is it a `NodeList` or `HTMLCollection` object?
   * Including the various sub-classes, or our custom lists.
   * 
   * @param {object} list
   * @returns {boolean}
   */
  isContainer(list) 
  { 
    return (this.isNodeList(list) || this.isHTMLCollection(list)); 
  }

  /**
   * Is it an event listener?
   * 
   * May be either a `function` or an `object` with a `handleEvent()` method.
   * 
   * @param {*} what 
   * @returns {boolean}
   */
  isListener(what) { return (typeof what === F || (isObj(what) && typeof what.handleEvent === F)); }

  /**
   * Given a string, parse it as HTML or XML using `DOMParser()`.
   * @param {string} string - The string to parse.
   * @param {(string|boolean)} [mimeType='text/html'] - The MIME type.
   * 
   * - If this is `true` we will use `text/xml`.
   * - If this is `false`, `null`, or `undefined` we will use `text/html`.
   * - If this is a `string` it must be one of the
   *   [PARSE_TYPE]{@link module:@lumjs/dom/util.PARSE_TYPE} properties.
   *  
   * @returns {Document} - Either an `HTMLDocument` or an `XMLDocument`.
   */
  parse(string, mimeType=PT.HTML)
  {
    if (typeof mimeType !== S)
      mimeType = mimeType ? PT.XML : PT.HTML;
    const parser = new this.window.DOMParser();
    return parser.parseFromString(string, mimeType);
  }

  /**
   * Parse a string as HTML, then return the main content elements.
   * 
   * @param {string} string - The HTML to parse.
   * @param {number} [mode=HTML_MODE.AUTO] How to handle return value.
   * 
   * This should always be one of the values from the
   * [HTML_MODES]{@link module:@lumjs/dom/util.HTML_MODE} Enum.
   * 
   * You can omit this parameter entirely and just pass an object
   * of `opts` if you want.
   * 
   * @param {object} [opts] Options
   * @param {number} [opts.mode] Same as the `mode` parameter.
   * @param {boolean} [opts.extend] Override `this.options.autoExtend`
   * @param {boolean} [opts.wrap] Override `this.options.autoWrap`
   * @param {boolean} [opts.adoptSingle] Adopt `Element` results?
   * @param {boolean} [opts.adoptMultiple] Adopt `HTMLCollection` results?
   * @param {boolean} [opts.adopt] Set both `adoptSingle` and `adoptMultiple`.
   * 
   * @returns {*} Parsed element(s).
   * 
   * The actual return value depends on the `mode` parameter.
   * In the default mode (`AUTO`), the output will always be either
   * an `Element` or an `HTMLCollection`.
   * 
   */
  html(string, mode=HM.AUTO, opts={})
  {
    if (isObj(mode))
    {
      opts = mode;
      mode = opts.mode ?? HM.AUTO;
    }

    let res;
    const doc = this.parse(string);

    if (mode === HM.DOC) return doc;

    const hasBody = doc.body && doc.body.childElementCount > 0;
    const hasHead = doc.head && doc.head.childElementCount > 0;

    if (mode === HM.HTML || !hasBody || hasHead)
    { // If there's no body, or the head has elements, return the whole document.
      res = doc.documentElement;
    }
    else if (mode === HM.BODY)
    { // Always return the body itself.
      res = doc.body;
    }
    else if (doc.body.childElementCount === 1)
    { // A single element.
      res = doc.body.children[0];
    }
    else if (mode === HM.AUTO_BODY)
    { // The body element itself.
      res = doc.body;
    }
    else 
    { // The children of the body.
      res = doc.body.children;
    }

    if (this.options.autoExtend && res)
    {
      this.extend(res);
    }

    return res;
  }

  /**
   * Parse a string as XML, then return the document element.
   * 
   * @param {string} string - The XML to parse.
   * @returns {Element} Parsed element.
   * 
   *   If `this.options.autoExtend` is `true` then the return value
   *   will be extended using `this.extend()` automatically.
   * 
   *   NOTE: if there are XML parser errors, there will be a `<parsererror/>`
   *   element in the returned element, as per the `DOMParser` specification.
   * 
   */
  xml(string, opts={})
  {
    const doc = this.parse(string, PT.XML);

    if (this.options.autoExtend)
    {
      this.extend(doc.documentElement);
    }

    return doc.documentElement;
  }

  /**
   * A shortcut to `document.createElement()`
   * 
   * @param {string} tagName 
   * @param {object} [options] 
   * @returns {Element}
   */
  elem(tagName, options)
  {
    return this.document.createElement(tagName, options);
  }

  /**
   * A shortcut to `document.createDocumentFragment()`
   * @returns {DocumentFragment}
   */
  frag()
  {
    return this.document.createDocumentFragment();
  }

  /**
   * A default `Query` instance.
   * @type {module:@lumjs/dom/query}
   */
  get query()
  {
    if (this.$query === undefined)
    {
      const Query = require('./query');
      this.$query = new Query(this);
    }
    return this.$query;
  }

  /**
   * A default `Events` instance.
   * @type {module:@lumjs/dom/events}
   */
  get events()
  {
    if (this.$events === undefined)
    {
      const Events = require('./events');
      this.$events = new Events(this);
    }
    return this.$events;
  }

  /**
   * A default `Extender` instance.
   * @type {module:@lumjs/dom/extend}
   */
  get extender()
  {
    if (this.$extender === undefined)
    {
      const Extender = require('./extend');
      this.$extender = new Extender(this);
    }
    return this.$extender;
  }

  /**
   * A default `ListCompiler` instance.
   * @type {module:@lumjs/dom/listcompiler}
   */
  get listCompiler()
  {
    if (this.$listCompiler === undefined)
    {
      const ListCompiler = require('./listcompiler');
      this.$listCompiler = new ListCompiler(this);
    }
    return this.$listCompiler;
  }

  /**
   * Find nodes matching a selector query.
   * 
   * Uses `this.query.find()` as the engine. 
   * @see {@link module:@lumjs/dom/query#find} for more details.
   * 
   * @param {string} query - The query selector.
   * @param {module:@lumjs/dom.QueryTarget} [inNode] - Node(s) to look in.
   *   Will default to the top-level `document` if not specified.
   * @param {boolean} [asHTMLCollection=this.options.findHTML]
   *   If `true`, this will return an `HTMLCollection` instead of a `NodeList`.
   * @returns {(NodeList|HTMLCollection)}
   * 
   * If `this.options.autoExtend` is `true`, the result
   * will be extended using `this.extend()`.
   * 
   */
  find(query, inNode=this.document, asHTMLCollection=this.options.findHTML) 
  { 
    const res = this.query.find(query, inNode, asHTMLCollection);
    if (this.options.autoExtend)
    {
      this.extend(res);
    }
    return res;
  }

  /**
   * Find the first child matching a selector query.
   * 
   * Uses `this.query.get()` as the engine.
   * @see {@link module:@lumjs/dom/query#get} for more details.
   * 
   * @param {string} query - The query selector.
   * @param {module:@lumjs/dom.QueryTarget} [inNode] - Node(s) to look in.
   * @returns {?Node}
   * 
   * If `this.options.autoExtend` is `true`, the result
   * will be extended using `this.extend()`.
   * 
   */
  get(query, inNode=this.document)  
  { 
    const res = this.query.get(query, inNode); 
    if (this.options.autoExtend && res)
    {
      this.extend(res);
    }
    return res;
  }

  /**
   * Add event handlers to target node(s).
   * 
   * An alias to `this.events.on()`;
   * @see {@link module:@lumjs/dom/events#on} for details.
   */
  on(...args)  
  { 
    return this.events.on(...args); 
  }

  /**
   * Remove event handlers from target node(s).
   * 
   * An alias to `this.events.off()`;
   * @see {@link module:@lumjs/dom/events#off} for details.
   */
  off(...args) 
  { 
    return this.events.off(...args); 
  }

  /**
   * Extend a node or node-container with additional features.
   * 
   * An alias to `this.extender.extend()`;
   * @see {@link module:@lumjs/dom/extend#extend} for details.
   */
  extend(node)
  {
    return this.extender.extend(node);
  }

  /**
   * Run a callback function when the DOM is ready.
   * 
   * If the DOM is ready when this is called, the callback
   * will be executed immediately.
   * 
   * @param {function} callback
   */
  whenReady(callback)
  {
    if (this.document.readyState === 'loading')
    {
      this.document.addEventListener('DOMContentLoaded', callback);
    }
    else
    {
      callback.call(this.document);
    }
  }

  /**
   * Run a callback function when the Window is fully loaded.
   * 
   * If the Window is loaded when this is called, the callback
   * will be executed immediately.
   * 
   * @param {function} callback 
   */
  whenWindowReady(callback)
  {
    if (this.document.readyState === 'complete')
    {
      callback.call(this.window);
    }
    else
    {
      this.window.addEventListener('load', callback);
    }
  }

  /**
   * Get a Promise that resolves using `whenReady()`
   */
  get ready()
  {
    return new Promise(resolve => 
    {
      this.whenReady(resolve);
    });
  }

  /**
   * Get a Promise that resolves using `whenWindowReady()`
   */
  get windowReady()
  {
    return new Promise(resolve =>
    {
      this.whenWindowReady(resolve);
    });
  }

} // LumDOM class

LumDOM.isWindow = isWindow;

/**
 * @alias module:@lumjs/dom.NODE_TYPE
 * @see module:@lumjs/dom/util.NODE_TYPE
 */
 LumDOM.NODE_TYPE = NT;

 /**
  * @alias module:@lumjs/dom.PARSE_TYPE
  * @see module:@lumjs/dom/util.PARSE_TYPE
  */
 LumDOM.PARSE_TYPE = PT;
 
 /**
  * @alias module:@lumjs/dom.HTML_MODE
  * @see module:@lumjs/dom/util.HTML_MODE
  */
 LumDOM.HTML_MODE = HM;
 
module.exports = LumDOM;

