Lum.lib(
{
  name: 'elemental',
  ns: 'Elemental',
},
function(Lum, Elemental)
{

// See elemental.md for details on this abandoned library.

const {isObj,S,N,F,B} = Lum._;

const VALID_TAG = /^[\w\-\:\.]+$/;
const EVENT_SEP = /[\s,]+/;

function parseHtml(text, opts={})
{
  const parser = new DOMParser();
  const html = parser.parseFromString(text, 'text/html');

  let multiple;
  if ('multiple' in opts)
  { // Explicitly set multiple value.
    multiple = opts.multiple;
  }
  else
  { // Auto-detect if there are multiple.
    multiple = (html.body.childElementCount > 1);
  }

  if (multiple)
  {
    const elements = Array.from(html.body.children);
    for (const element of elements)
    {
      document.adoptNode(element);
    }
    return elements;
  }
  else
  {
    const element = html.body.firstElementChild;
    document.adoptNode(element);
    return element;
  }
}    

class ElementalItem
{
  constructor(elem, options={})
  {
    if (typeof elem === S)
    {
      if (VALID_TAG.test(elem))
      { // It's a simple element tag.
        elem = document.createElement(elem);
      }
      else
      { // Assume it's an HTML snippet.
        elem = parseHtml(elem, {multiple: false});
      }
    }
    else if (!(elem instanceof Element))
    {
      throw new TypeError("must be a string or Element");
    }

    this.element = elem;
    this.options = options;
    this.autoWrap = options.autoWrap ?? false;
  }

  get id() { return this.element.id; }
  set id(id) { this.element.id = id; }

  get class()
  {
    return this.element.classList;
  }

  set class(className)
  {
    if (typeof className === S)
    {
      this.element.className = className;
    }
    else if (Array.isArray(className))
    {
      this.element.classList.add(...className);
    }
  }

  get firstElement() { return this.element.firstElementChild; }
  get lastElement()  { return this.element.lastElementChild;  }

  get first() { return this._make(this.firstElement); }
  get last()  { return this._make(this.lastElement);  }

  get children() 
  { 
    const children = this.element.children, opts = this.options;
    return new ElementalCollection(children, opts);
  }

  get(query, wrap=this.autoWrap)
  {
    let elem;
    if (typeof query === N)
    { // An index.
      elem = this.element.children[query];
    }
    else if (typeof query === S)
    { // A selector.
      elem = this.element.querySelector(query);
    }

    if (elem && wrap)
    { // Return another magic instance.
      return this._make(elem);
    }
    
    // Return the raw element.
    return elem;
  }

  find(query, wrap=this.autoWrap)
  {
    const elems = this.element.querySelectorAll(query);

    if (wrap)
    {
      return new ElementalCollection(elems, this.options);
    }

    return elems;
  }

  add(elem)
  {
    if (typeof elem === S)
    {
      if (!VALID_TAG.test(elem))
      { // Not a valid tag, so must be something else.
        if (elem.startsWith('<') && elem.endsWith('>'))
        { // Assuming an HTML snippet.
          return this.addHTML(elem);
        }
        else
        { // Assuming just plain old text.
          return this.addText(elem);
        }
      }

      elem = document.createElement(elem);
    }
    else if (elem instanceof ElementalItem)
    {
      elem = elem.element;
    }

    this.element.appendChild(elem);
    return this;
  }
  
  addHTML(html)
  {
    this.element.insertAdjacentHTML('beforeend', html);
    return this;
  }

  addText(text)
  {
    const node = document.createTextNode(text);
    this.element.appendChild(node);
    return this;
  }

  addTo(parent)
  {
    if (parent instanceof ElementalItem)
    {
      parent = parent.element;
    }
    parent.appendChild(this.element);
  }

  on()
  {
    return new EventHandler(this.element, arguments);
  }

  _make(elem, options=this.options)
  {
    return new this.constructor(elem, options);
  }

} // class ElementalItem

Elemental.Item = ElementalItem;

class ElementalCollection
{
  constructor(elems, options)
  {
    if (typeof elems === S)
    { // Assume a snippet of HTML.
      elems = parseHtml(elems, {multiple: true});
    }
    else if (!(Array.isArray(elems)
      || elems instanceof NodeList
      || elems instanceof HTMLCollection))
    {
      throw new TypeError("must be a string, Array, HTMLCollection, or NodeList");
    }

    const items = [];
    for (const elem of elems)
    {
      items.push(new ElementalItem(elem, options));
    }

    this.elements = elems;
    this.items = items;
    this.options = options;
    this.autoWrap = options.autoWrap ?? false;
  }

  get(query, wrap=this.autoWrap)
  {
    for (const item of this.items)
    {
      const res = item.get(query, wrap);
      if (res) return res;
    }
  }

  find(query, wrap=this.autoWrap)
  {
    const results = [];

    for (const item of this.items)
    {
      const subresults = item.find(query, false);
      for (const elem of subresults)
      {
        results.push(elem);
      }
    }

    if (wrap)
    {
      return this._make(results);
    }

    return results;
  }

  _call(meth, args)
  {
    for (const item of this.items)
    {
      item[meth](...args);
    }
  }

  on()
  {
    return new EventHandler(this.elements, arguments);
  }

  _make(elems, options=this.options)
  {
    return new this.constructor(elems, options);
  }

} // class ElementalCollection

const callMeths = ['add','addHTML','addText','addTo'];
for (const meth of callMeths)
{
  ElementalCollection.prototype[meth] = function()
  {
    return this._call(meth, arguments);
  }
}

Elemental.Collection = ElementalCollection;

class EventHandler
{
  constructor(elems, args)
  {
    this._setElems(elems);
    this._setArgs(args);
    this._register();
  }

  _setElems(elems)
  {
    if (Array.isArray(elems)
      || elems instanceof HTMLCollection
      || elems instanceof NodeList)
    {
      this._elements = elems;
    }
    else if (elems instanceof Element)
    {
      this._elements = [elems];
    }
    else
    {
      console.error("unhandled element(s)", elems);
    }
  }

  _setArgs(args)
  {
    const unhandled = [];
    
    for (const arg of args)
    {
      if (typeof arg === S)
      {
        if (!this._events)
        { 
          this._events = arg.split(EVENT_SEP);
        }
        else if (!this._delegated)
        {
          this._delegated = arg;
        }
        else
        {
          unhandled.push(arg);
        }
      }
      else if (typeof arg === F)
      { 
        if (!this._event_listener)
        {
          this._event_listener = arg;
        }
        else if (!this._delegated)
        {
          this._delegated = arg;
        }
        else
        {
          unhandled.push(arg);
        }
      }
      else if (typeof arg === B && !this._options)
      {
        this._options = arg;
      }
      else if (Array.isArray(arg) && !this._events)
      {
        this._events = arg;
      }
      else if (isObj(arg) && !this._options)
      {
        this._options = arg;
      }
      else
      {
        unhandled.push(arg);
      }
    }

    if (unhandled.length > 0)
    {
      console.error("unhandled arguments", unhandled);
    }
  }

  _register()
  {
    if (!this._elements || !this._events || !this._event_listener)
    {
      console.error("Missing required arguments", this);
      return;
    }

    if (!this._options) this._options = {};

    const handler = this;

    let delegate;
    if (typeof this._delegated === S)
    {
      delegate = target => target.matches(this._delegated);
    }
    else if (typeof this._delegated === F)
    {
      delegate = this._delegated;
    }

    let fn;
    if (delegate)
    { // Delegated event listener.
      fn = function(ev)
      {
        if (ev.target instanceof Element && delegate.call(this, ev.target, ev))
        {
          Object.defineProperty(ev, 'captureTarget', {value: this});
          const retval = handler._event_listener.call(ev.target, ev);
          if (handler._options.onceForAll)
          { // An extended version of the standard `once` option.
            handler.off();
          }
          return retval;
        }
      }
    }
    else if (this._options.onceForAll)
    { // Non-delegated, but run once for all events.
      fn = function(ev)
      {
        const retval = handler._event_listener.call(this, ev);
        handler.off();
        return retval;
      }
    }
    else
    { // Use the listener directly.
      fn = handler._event_listener;
    }

    this._listener_fn = fn;

    for (const elem in this._elements)
    {
      for (const event of this._events)
      {
        elem.addEventListener(event, fn, this._options);
      }
    }
  }

  off()
  {
    const fn = this._listener_fn, opts = this._options;
    for (const elem of this._elements)
    {
      for (const ev in this._events)
      {
        elem.removeEventListener(ev, fn, opts);
      }
    }
  }

} // class EventHandler

Elemental.EventHandler = EventHandler;

});