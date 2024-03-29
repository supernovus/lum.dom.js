
const core = require('@lumjs/core');
const {F,def,isObj} = core.types;
const {getProperty} = core.obj;
const {getNodeSymbol} = require('./util');

const EXTENDED = new core.InternalObjectId({name: 'LumDomExtended'});

const ORIGINALS = Symbol('LumDomExtendedOriginals');
const getOriginals = node => getNodeSymbol(node, ORIGINALS);

/**
 * The `Extender` class can extend DOM objects with additional functionality.
 * @exports module:@lumjs/dom/extend
 */
class Extender
{
  /**
   * Build an Extender instance.
   * @param {*} dom - The parent DOM helper instance.
   */
  constructor(dom)
  {
    this.dom = dom;
  }

  /**
   * Extend a Node, NodeList, or HTMLCollection.
   * 
   * This will add new methods and accessor properties based on the
   * definitions in the `Extender.fn` object.
   * 
   * @param {module:@lumjs/dom.Target} node - The object to extend. 
   * @returns {object} `this`
   */
  extend(node)
  {
    if (EXTENDED.is(node)) return this; // It's already extended.

    if (this.dom.isNode(node))
    {
      for (const mname in Extender.fn)
      {
        let orig = getProperty(node, mname);
        if (isObj(orig))
        {
          const data = getOriginals(node);
          data[mname] = orig;
        }

        const mdef = Extender.fn[mname];
        let target;
        if (mdef.nodeState)
        {
          target = 
          {
            item: node,
            dom: this.dom,
            name: mname,
            defs: mdef,
            original: orig,
            extender: this,
          }
        }
        else 
        {
          target = node;
        }

        if (typeof mdef.nodeValue === F)
        {
          def(node, mname, function() 
          { 
            return mdef.nodeValue.apply(target, arguments); 
          });
        }
        else if (typeof mdef.nodeGet === F)
        {
          const bindings =
          {
            get: function()
            {
              return mdef.nodeGet.call(target);
            },
          }
          if (typeof mdef.nodeSet === F)
          {
            bindings.set = function(value)
            {
              return mdef.nodeSet.call(target, value);
            }
          }
          def(node, mname, bindings);
        }
      }
    }
    else if (this.dom.isContainer(node)) 
    {
      const self = this;
      for (const mname in Extender.fn)
      {
        let orig = getProperty(node, mname);
        if (isObj(orig))
        {
          const data = getOriginals(node);
          data[mname] = orig;
        }

        const mdef = Extender.fn[mname];
        let target;

        if (mdef.listState)
        {
          target = 
          {
            item: node,
            dom: this.dom,
            name: mname,
            defs: mdef,
            original: orig,
            extender: this,
          }
        }
        else 
        {
          target = node;
        }

        const each = function()
        {
          const output = [];
          for (const child of node)
          {
            let subtarget;
            if (mdef.nodeState)
            {
              subtarget = 
              {
                item: child,
                dom: self.dom,
                name: mname,
                defs: mdef,
                extender: self,
                parent: target,
              }
            }
            else 
            {
              subtarget = child;
            }

            if (typeof mdef.nodeValue === F)
            {
              output.push(mdef.nodeValue.apply(subtarget, arguments));
            }
            else if (arguments.length === 0 && typeof mdef.nodeGet === F)
            {
              output.push(mdef.nodeGet.call(subtarget));
            }
            else if (arguments.length === 1 && typeof mdef.nodeSet === F)
            {
              output.push(mdef.nodeSet.call(subtarget, arguments[0]));
            }
          }
          return output;
        } // each()

        if (mdef.listState)
        {
          target.each = each;
        }

        if (typeof mdef.listValue === F)
        {
          def(node, mname, function() 
          { 
            return mdef.listValue.apply(target, arguments); 
          });
        }
        else if (typeof mdef.listGet === F)
        {
          const bindings =
          {
            get: function()
            {
              return mdef.listGet.call(target);
            },
          }
          if (typeof mdef.listSet === F)
          {
            bindings.set = function(value)
            {
              return mdef.listSet.call(target, value);
            }
          }
          def(node, mname, bindings);
        }
        else if (typeof mdef.nodeValue === F)
        { // A fallback that simply uses the each() method as defined above.
          def(node, mname, each);
        }
        else if (typeof mdef.nodeGet === F)
        { // A fallback that uses each() for the getter and setter.
          const bindings =
          {
            get: each,
          }
          if (typeof mdef.nodeSet === F)
          {
            bindings.set = each;
          }
          def(node, mname, bindings);
        }
      } // for Extender.methods
    } // else if nodeContainer
    else 
    {
      throw new TypeError("Target node must be a Node, NodeList, or HTMLCollection");
    }

    // Tag it.
    EXTENDED.tag(node);

    return this;
  } //extend() 

  /**
   * Remove extensions from a previously extended object.
   * 
   * @param {module:@lumjs/dom.Target} node - The node(s) to restore.
   * @returns {object} `this`
   */
  restore(node)
  {
    if (!EXTENDED.is(node)) return this; // It's not extended.

    const originals = getOriginals(node);

    for (const mname in Extender.fn)
    {
      if (isObj(originals[mname]))
      { // Restore the original.
        def(node, mname, originals[mname]);
        delete(originals[mname]);
      }
      else 
      { // Just delete our added property.
        delete(node[mname]);
      }
    }

    // Remove the tag.
    EXTENDED.untag(node);

    return this;
  }

} // Extender class

module.exports = Extender;

/**
 * The extension definitions.
 * 
 * These are meant for use with custom methods.
 * I've added some sample methods to show how it works.
 * 
 * A few of the extensions I've included:
 * 
 * - `attr()` → Emulates the `jQuery` method of the same name.
 *   This is the only method that makes use of the more advanced
 *   features offered by the `Extender`. The rest of the following
 *   are simplistic wrappers around methods in the `dom` object.
 * - `find(query)` → Runs `dom.find(query, this)`
 * - `get(query)` → Runs `dom.get(query, this)`
 * - `on(event, ...)` → Runs `dom.on(this, ...arguments)`
 * - `off(event, ...)` → Runs `dom.off(this, ...arguments)`
 * - `trigger(event, options)` → Runs `dom.trigger(this, ...arguments)`
 * 
 * In each of the examples, `this` will be the `Node`, `NodeList`,
 * or `HTMLContainer` that was extended.
 */
Extender.fn =
{
  attr:
  { 
    nodeState: false,
    nodeValue(key, value)
    {
      if (value === undefined)
      {
        return this.getAttribute(key);
      }
      else if (value === null)
      {
        this.removeAttribute(key);
      }
      else 
      {
        this.setAttribute(key, value);
      }
      return this;
    },
    listState: true,
    listValue(key, value)
    {
      if (value === undefined)
      {
        return this.item.item(0).getAttribute(key);
      }
      else 
      {
        this.each(key, value);
        return this;
      }
    },
  },
} // Extender.methods

{ // Add query wrappers.
  const funs = ['find', 'get'];
  for (const fun of funs)
  {
    const domQuery = function(query)
    {
      return this.dom[fun](query, this.item);
    }

    Extender.fn[fun] =
    {
      nodeState: true,
      nodeValue: domQuery,
      listState: true,
      listValue: domQuery,
    }
  }
} // query wrappers

{ // Add event wrappers.
  const funs = ['on', 'off', 'trigger'];
  for (const fun of funs)
  {
    const domEvent = function(...args)
    {
      return this.dom[fun](this.node, ...args);
    }

    Extender.fn[fun] = 
    {
      nodeState: true,
      nodeValue: domEvent,
      listState: true,
      listValue: domEvent,
    }
  }
}
