const core = require('@lumjs/core');
const {S,isInstance,needType,needObj,isObj} = core.types;
const {getNodeSymbol} = require('./util');

const EVENTS = Symbol('QueryResultEventHandlers');
const getNodeEvents = node => getNodeSymbol(node, EVENTS);

function eventSuffix(options)
{
  let suffix = '';
  if (typeof options.selector === S)
  {
    suffix = `(${options.selector.replaceAll(/\s/g, '')})`;
  }
  if (options.capture)
  {
    suffix += ':capture';
  }
  return suffix;
}

/**
 * A map of events names to event classes.
 * 
 * Currently includes:
 * 
 * - `wheel` → `WheelEvent`
 * - `copy, cut, paste` → `ClipboardEvent`
 * - `blur, focus, focusin, focusout` → `FocusEvent`
 * - `keydown, keypress, keyup` → `KeyboardEvent`
 * - `auxclick, click, contextmenu, dblclick` → `MouseEvent`
 * - `mousedown, mouseenter, mouseleave, mousemove` → `MouseEvent`
 * - `mouseout, mouseover, mouseup` → `MouseEvent`
 * - `touchcancel, touchend, touchmove, touchstart` → `TouchEvent`
 * 
 * Has a few other properties for internal use that
 * I'll document when I get around to it.
 * 
 * @alias module:@lumjs/dom/events.CLASSES
 * @type {object}
 */
const EVENT_CLASSES =
{
  _default: 'Event',
  _custom: 'CustomEvent',
  error: 'UIEvent',
  wheel: 'WheelEvent',
  $add(type, ...events)
  {
    for (const ev of events)
    {
      this[ev] = type;
    }
    return this;
  },
} .$add('ClipboardEvent', 'copy', 'cut', 'paste')
  .$add('FocusEvent', 'blur', 'focus', 'focusin', 'focusout')
  .$add('KeyboardEvent', 'keydown', 'keypress', 'keyup')
  .$add('MouseEvent', 'auxclick', 'click', 'contextmenu', 'dblclick', 
    'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout',
    'mouseover', 'mouseup')
  .$add('TouchEvent', 'touchcancel', 'touchend', 'touchmove', 'touchstart');

/**
 * The `Events` class for managing DOM events in a more efficient manner.
 * 
 * @property {module:@lumjs/dom} dom - The parent `LumDOM` object.
 * @exports module:@lumjs/dom/events
 */
class Events
{
  /**
   * Build an Events instance.
   * @param {module:@lumjs/dom} dom - The parent DOM helper instance.
   */
  constructor(dom)
  {
    this.dom = dom;
    this.events = [];
  }

  // Make a normalized event definition structure.
  $eventDef(target, types, options, eventListener)
  {
    needType(S, types);

    if (this.isListener(options))
    { // Reversed order.
      const temp = eventListener;
      eventListener = options;
      options = temp;
    }
    else if (!this.isListener(eventListener))
    {
      throw new TypeError("Invalid listener");
    }
    
    if (typeof options === S)
    { // A string is considered the 'selector' option.
      options = {selector: options};
    }
    else if (typeof options === B)
    { // A boolean is considered the 'capture' option.
      options = {capture: options};
    }
    else if (!isObj(options))
    { // Empty options.
      options = {};
    }

    if (this.dom.isNode(target))
    { // A single node, wrap it in an array.
      target = [target];
    }
    else if (!this.dom.isContainer(target))
    { // Not a Node or a node container? 
      throw new TypeError("target must be a Node, NodeList, or HTMLCollection");
    }

    return {target, types: types.trim().split(/\s+/), options, eventListener};
  }

  /**
   * Assign an event handler to our current nodes.
   * 
   * @param {module:@lumjs/dom.Target} target - The target node(s).
   * @param {string} types - A space-separated list of event types.
   * @param {object} options - Options for `addEventListener()`.
   *   In addition to the standard options, there's a few specific
   *   to this method.
   * @param {string} [options.selector] - Selector for delegation.
   *   If this is used then the event handler will be wrapped in
   *   a separate function that will pass this to `event.target.matches()`
   *   to determine if the delegated event handler should be called.
   * @param {(object|true)} [options.ctrl] Use an `AbortController`.
   *   If this is `true` then we'll create a new `AbortController` and
   *   replace the `options.ctrl` with the new instance.
   * @param {(function|object)} handler - The event handler.
   *   
   *   The `options` and `handler` parameters *may* be swapped.
   * 
   * @returns {object} `this`
   */
  on(...args)
  {
    const {target, types, options, eventListener} = this.$eventDef(...args);
    
    let listener;

    if (typeof options.selector === S)
    { // A sub-selector for delegated events.
      const selector = options.selector;
      const isElem = what => this.dom.isElement(what);
      listener = function(e)
      {
        if (isElem(e.target) && e.target.matches(selector))
        { // The target matched. So call the real event listener now.
          def(e, 'captureTarget', this);
          return eventListener.call(e.target, e);
        }
      }
    }
    else 
    { // No sub-selector, use the real event listener.
      listener = eventListener;
    }

    if (options.ctrl === true)
    { // Create an AbortController, and assign its signal.
      options.ctrl = new this.dom.window.AbortController();
    }

    if (isObj(options.ctrl) && options.signal === undefined)
    { // Set the signal.
      options.signal = options.ctrl.signal;
    }

    const suffix = eventSuffix(options);
    
    for (const node of target)
    {
      const eventData = getNodeEvents(node);
      for (const type of types)
      {
        const eid = type+suffix;
        if (isObj(eventData[eid]))
        { // An existing event using our system was already registered.
          throw new Error("Cannot re-assign an event without removing the old one first");
        }
        node.addEventListener(type, listener, options);
        const eventDef = new EventHandler(node, type, listener, options);
        eventData[eid] = eventDef;
        this.events.push(eventDef);
      }
    }

    return this;
  } // on()

  /**
   * Remove an event handler from our current nodes.
   * 
   * @param {module:@lumjs/dom.Target} target - The target node(s).
   * @param {string} types - A space-separated list of event types.
   * @param {object} options - Options for `removeEventListener()`.
   * @param {string} [options.selector] - Selector for delegation.
   *   See `on()` for more details.
   * @param {(function|object)} handler - The event handler.
   *   
   *   The `options` and `handler` parameters *may* be swapped.
   * 
   * @returns {object} `this`
   */
  off(...args)
  {
    const {target, types, options, eventListener} = this.$eventDef(...args);
    const suffix = eventSuffix(options);
    for (const node of target)
    {
      const eventData = getNodeEvents(node);
      for (const type of types)
      {
        const eid = type+suffix;
        if (isObj(eventData[eid]))
        { // We found a definition.
          eventData[eid].off();
        }
        else if (this.isListener(eventListener))
        { // Couldn't find a definition, we're going to try the direct method.
          node.removeEventListener(type, eventListener, options);
        }
      }
    }
    return this;
  } // off()

  /**
   * Build a new `Event` object.
   * 
   * It will use `Events.CLASSES` to determine which underlying
   * event class to use. So `click` will be a `MouseEvent` while
   * `keydown` will be a `KeyboardEvent`, and so forth.
   * 
   * Any unrecognized event name will use `CustomEvent` if 
   * `options.detail` is specified, or `Event` otherwise.
   * 
   * @param {string} type - The event name.
   * @param {object} [options] Options for the event. 
   * @returns {Event} 
   */
  build(type, options={})
  {
    needType(S, type, 'type must be a string');
    needObj(options, 'options must be an object');
    let classname;
    if (type in EVENT_CLASSES)
    {
      classname = EVENT_CLASSES[type];
    }
    else if ('detail' in options)
    {
      classname = EVENT_CLASSES._custom;
    }
    else 
    {
      classname = EVENT_CLASSES._default;
    }

    const eventClass = this.dom.window[classname];
    if (typeof eventClass === F)
    {
      return new eventClass(type, options);
    }
    else 
    {
      throw new TypeError("no such event class: "+classname);
    }
  } // build()

  /**
   * Trigger an event on a set of nodes.
   * 
   * @param {module:@lumjs/dom.Target} target - The target node(s).
   * @param {(string|Event)} event - The event to trigger.
   *   If this is a `string` then we'll use `build()` to
   *   generate an `Event` object.
   * @param {object} [options] Options.
   * @param {boolean} [options.newEventForEach=false]
   *   If `true` and `event` is a `string` we'll generate a new
   *   `Event` object for each node. If `false` and `event` is
   *   a `string` then we'll generate a single `Event` and use it
   *   for each node. Has no effect at all if `event` is an `Event`. 
   * 
   * @returns {object} `this`
   */
  trigger(target, event, options={})
  {
    if (this.dom.isNode(target))
    { // A single node, wrap it in an array.
      target = [target];
    }
    else if (!this.dom.isContainer(target))
    { // Not a Node or a node container? 
      throw new TypeError("target must be a Node, NodeList, or HTMLCollection");
    }

    if (typeof event === S)
    { 
      if (!options.newEventForEach)
      { // Build a single event object for all nodes.
        event = this.build(event, options);
      }
    }
    else if (!isInstance(event, this.dom.window.Event))
    { // The event object must be an `Event` or a subclass of it.
      throw new TypeError("event must be a string or an Event object");
    }

    for (const node of target)
    {
      let evObj;
      if (typeof event === S)
      { // Build a separate event object for each node.
        evObj = this.build(event, options);
      }
      else
      { // Use the same event object for each.
        evObj = event;
      }

      // Okay, dispatch now.
      node.dispatchEvent(evObj);
    }

    return this;
  } // trigger()

} // class Events

module.exports = Events;

/**
 * An internal class used by `Events` to keep track of
 * event handlers its assigned. Not generally useful for outside code.
 * @alias module:@lumjs/dom/events.Handler
 */
class EventHandler 
{
  constructor(node, type, listener, options)
  {
    this.node = node;
    this.type = type;
    this.listener = listener;
    this.options = options;
  }

  off()
  {
    this.node.removeEventListener(this.type, this.listener, this.options);
  }

  abort()
  {
    if (isObj(this.options.ctrl) && typeof this.options.ctrl.abort === F)
    {
      this.options.ctrl.abort();
    }
  }
}

Events.Handler = EventHandler;
Events.CLASSES = EVENT_CLASSES;
