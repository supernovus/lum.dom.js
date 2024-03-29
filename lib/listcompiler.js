const core = require('@lumjs/core');
const {F,S,needType,needObj} = core.types;

const PLACEHOLDER = new core.InternalObjectId(
{
  name: 'LumDomListCompilerPlaceholder'
});

/**
 * The `ListCompiler` class for compiling DOM objects that don't 
 * have constructors.
 * 
 * Some DOM objects like `NodeList`, and `HTMLCollection` don't have any
 * regular constructors and normally cannot be manually created.
 * 
 * We use some dark voodoo to create objects that conform to the APIs
 * of the desired list class, *and* set the prototype to a valid instance
 * of that class, so it simply works.
 * 
 * @exports module:@lumjs/dom/listcompiler
 */
class ListCompiler
{
  /**
   * Build a ListCompiler instance.
   * @param {object} dom - Our parent DOM helper instance.
   */
  constructor(dom)
  {
    this.dom = dom;
    const frag = dom.document.createDocumentFragment();
    this.protos =
    {
      NodeList: frag.childNodes,
      HTMLCollection: frag.children,
    }
  }

  /**
   * Return a `ListBuilder` instance.
   * @param {(object|string)} proto - The prototype to use.
   *   Must either be the prototype object itself, or the name
   *   of one of the prototypes in `this.protos` which currently
   *   is only `NodeList` and `HTMLCollection`. Extra ones may
   *   be added dynamically.
   * @returns {module:@lumjs/dom/listcompiler~ListBuilder}
   */
  buildList(proto)
  {
    if (typeof proto === S && isObj(this.protos[proto]))
    { // The name of a known prototype class.
      proto = this.protos[proto];
    }

    needObj(proto);

    return new ListBuilder(this, proto)
  }

  /**
   * Get a `ListBuilder` for `NodeList` objects.
   * @returns {module:@lumjs/dom/listcompiler~ListBuilder}
   */
  buildNodeList()
  {
    return this.buildList(this.protos.NodeList);
  }

  /**
   * Get a `ListBuilder` for `HTMLCollection` objects.
   * @returns {module:@lumjs/dom/listcompiler~ListBuilder}
   */
  buildHTMLCollection()
  {
    return this.buildList(this.protos.HTMLCollection);
  }

  /**
   * Get a `ListBuilder` for `TouchList` objects.
   * @returns {module:@lumjs/dom/listcompiler~ListBuilder}
   */
  buildTouchList()
  {
    if (!this.protos.TouchList)
    {
      const TEV = 'touchstart';
      const touchEvent = new this.dom.window.TouchEvent(TEV);
      this.protos.TouchList = touchEvent.touches;
    }
    return this.buildList(this.protos.TouchList);    
  }

  /**
   * Build a `NodeList` object from a list of nodes.
   * @param  {...object} nodes - Nodes to add.
   *   May be instances of `Node`, `NodeList`, or `HTMLCollection`.
   * @returns {NodeList}
   */
  makeNodeList(...nodes)
  {
    const list = this.buildNodeList();

    for (const node of nodes)
    {
      if (dom.isNode(node))
      { // Add a single node.
        list.addNode(node);
      }
      else if (dom.isNodeCollection(node))
      { // A collection of nodes.
        for (const subNode of node)
        {
          list.addNode(node);
        }
      }
    } 

    return list.compile();
  } // makeNodeList()

  /**
   * Build a `HTMLCollection` object from a list of nodes.
   * @param  {...object} nodes - Nodes to add.
   *   May be instances of `Element`, `NodeList`, or `HTMLCollection`.
   *   Only `Element` children of the list instances will be added.
   * @returns {NodeList}
   */
  makeHTMLCollection(...nodes)
  {
    const list = this.buildHTMLCollection();

    list.addMethod('namedItem', function(key) 
    {
      for (let i = 0; i < this.length; i++)
      {
        if (this[i].id === key || this[i].name === key)
        {
          return this[i];
        }
      }
      return null;
    });

    const addNode = node => 
    {
      list.addNode(node); // Add the indexed node.
      if (node.id && list[node.id] === undefined)
      { // Add 'id' reference.
        list.addAlias(node, node.id);
      }
      if (node.name && list[node.name] === undefined)
      { // Add 'name' reference.
        list.addAlias(node, node.name);
      }
    }

    for (const node of nodes)
    {
      if (dom.isElement(node))
      { // Add a single node.
        addNode(node);
      }
      else if (dom.isNodeCollection(node))
      { // A collection of nodes.
        for (const subNode of node)
        {
          if (dom.isElement(subNode))
          {
            addNode(subNode);
          }
        }
      }
    }

    return list.compile();
  } // makeHTMLCollection()

} // ListCompiler class

module.exports = ListCompiler

/**
 * A child class used by `ListCompiler` to build the list objects.
 * 
 * @property {module:@lumjs/dom/listcompiler} compiler - The parent compiler.
 * @property {object} proto - The prototype object to use for the list.
 * @property {number} length - The current length of our node list.
 * @property {object} list - Properties to add to the list object.
 *   This is a set of property descriptors as used by `Object.create()`
 *   or `Object.defineProperties()`. They will be added automatically by the
 *   various methods of this instance. Manually modifying this is highly
 *   discouraged. Use the API methods instead.
 * 
 * @alias module:@lumjs/dom/listcompiler.ListBuilder
 */
class ListBuilder
{
  /**
  * Build a ListBuilder instance.
  * @param {module:@lumjs/dom/listcompiler} compiler - The parent compiler.
  * @param {object} proto - The prototype object to use for the list.
  */
  constructor(compiler, proto)
  {
    this.compiler = compiler;
    this.proto = proto;
    this.list = 
    { // The very basic bits that every list type has.
      item:
      {
        value(i)
        {
          return this[+i || 0];
        },
        enumerable: true,
      },
    }
    this.length = 0;
  }

  /**
  * Add a positional node.
  * 
  * This will automatically increment `this.length` which is used
  * to determine the next positional index to use in the list.
  * 
  * @param {Node} node - The node to add.
  * @returns {void}
  */
  addNode(node)
  {
    needObj(node);
    this.list[this.length++] = {value: node, enumerable: true, configurable: true};
  }

  /**
  * Placeholder set() method.
  * @callback module:@lumjs/dom/listcompiler~PlaceHolderSetMethod
  * @param {object} node - The node to replace the placeholder with.
  *   In some cases this may be another list object instead of a node.
  *   In all cases it must be a valid non-null `object`.
  * @returns {void}
  */

  /**
   * A placeholder object.
   * @typedef {object} module:@lumjs/dom/listcompiler~PlaceHolderObject
   * @property {number} index - The position in the list we're building.
   * @property {*} value - Will be `null` until `set()` is called.
   * @property {module:@lumjs/dom/listcompiler~PlaceHolderSetMethod} set 
   *   The `set()` method.
   *   Once called, the `value` will be set, and the `index` and `set`
   *   properties will be removed, at which point the placeholder will
   *   be a regular property descriptor at that point..
   */

  /**
   * Add a placeholder object.
   * 
   * This will automatically increment `this.length` which is used
   * to determine the next positional index to use in the list.
   * 
   * @returns {module:@lumjs/dom/listcompiler~PlaceHolderObject} 
   *   A placeholder object.
   */
  addPlaceholder()
  {
    const pos = this.length++;
    this.list[pos] = PLACEHOLDER.tag(
    {
      index: pos,
      value: null,
      enumerable: true,
      configurable: true,
      set: function(node)
      { // Replace this with another object.
        needObj(node);
        this.value = node;
        delete(this.index);
        delete(this.set);
      }
    });
    return this.list[pos];
  }

  /**
   * Add an alias to a node or placeholder.
   * 
   * This does *not* increment `this.length` as aliases
   * do not count towards the total number of nodes in the list.
   * 
   * @param {object} node - The node or placeholder
   * @param {string} key - The alias name.
   * @param {boolean} [enumerable=false]
   * @param {boolean} [configurable=true] 
   * @returns {void}
   */
  addAlias(node, key, enumerable=false, configurable=true)
  {
    needObj(node);
    needType(S, key, 'key must be a string');
    const alias = PLACEHOLDER.is(node) 
      ? node 
      : {value: node, enumerable, configurable};
    this.list[key] = alias;
  }

  /**
   * Add a method to the list.
   * 
   * @param {string} name - The name of the method to add.
   * @param {function} method - The method definition.
   * @param {boolean} [enumerable=true] 
   * @param {boolean} [configurable=false] 
   * @returns {void}
   */
  addMethod(name, method, enumerable=true, configurable=false)
  {
    needType(S, name, 'name must be a string');
    needType(F, method, 'method must be a function');
    this.list[name] = {value: method, enumerable, configurable};
  }

  /**
   * Finish building the list and return it.
   * 
   * This ensures the `length` property is set in the list
   * to match the builder's current `length` property.
   * 
   * @returns {object} The compiled list object.
   */
  compile()
  {
    this.list.length = {value: this.length, enumerable: true};
    return Object.create(this.proto, this.list);
  }
}

/* Maybe add later:
 - HTMLFormControlsCollection
 - HTMLOptionsCollection
 - RadioNodeList
 any other ones...
*/
