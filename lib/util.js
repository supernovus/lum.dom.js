const core = require('@lumjs/core');
const {isObj} = core.types;
const Enum = core.Enum;

/**
 * Helper constants, enums, and functions.
 * @module @lumjs/dom/util
 */

/**
 * A list of valid node types.
 * 
 * @alias module:@lumjs/dom/util.NODE_TYPE
 * @prop {number} ELEM - An `Element` node.
 * @prop {number} ATTR - An `Attr` node in an `Element`.
 * @prop {number} TEXT - A `Text` node in an `Element` or `Attr`.
 * @prop {number} CDATA - A `CDATASection` node.
 * @prop {number} ENTREF - OBSOLETE: An entity reference.
 * @prop {number} ENTITY - OBSOLETE: An entity node.
 * @prop {number} PI - A `ProcessingInstruction` node.
 * @prop {number} COMMENT - A `Comment` node.
 * @prop {number} DOC - A `Document` node.
 * @prop {number} DOCTYPE - A `DocumentType` node.
 * @prop {number} FRAG - A `DocumentFragment` node.
 * @prop {number} NOTATION - OBSOLETE: A notation node.
 */
const NT = Object.freeze(
{
  ELEM: 1,
  ATTR: 2,
  TEXT: 3,
  CDATA: 4,
  ENTREF: 5,
  ENTITY: 6,
  PI: 7,
  COMMENT: 8,
  DOC: 9,
  DOCTYPE: 10,
  FRAG: 11,
  NOTATION: 12,
});

exports.NODE_TYPE = NT;
  
// A list for isQueryNode().
exports.VALID_ROOTS = [NT.ELEM, NT.DOC, NT.FRAG];

/**
 * A list of mime-type values for `DOMParser.parseFromString()`
 * and our own `parseString()` wrapper around it.
 * 
 * @alias module:@lumjs/dom/util.PARSE_TYPES
 * @prop {string} HTML
 * @prop {string} XML
 * @prop {string} XMLTEXT
 * @prop {string} XHTML
 * @prop {string} SVG
 */
exports.PARSE_TYPE = Object.freeze(
{
  HTML: 'text/html',
  XML: 'application/xml',
  XMLTEXT: 'text/xml',
  XHTML: 'application/xhtml+xml',
  SVG: 'image/svg+xml',
});

/**
 * An `Enum` of modes for the `html()` method.
 *
 * @alias module:@lumjs/dom/util.HTML_MODE
 * @prop {number} AUTO - Auto-determine the return value.
 * 
 * - If there are *any* child elements in the `<head/>`, or there
 *   are **no** child elements in the `<body/>`, then the top-level
 *   `<html/>` element will be returned.
 * - If the `<body/>` has *only one* child element, then the single
 *   *child element* will be returned.
 * - If there are multiple elements in the body, return the `body.children`
 *   property which is an `HTMLCollection` of child elements.
 * 
 * @prop {number} AUTO_BODY - Auto-determine the return value.
 * 
 * This is the same as the `AUTO` mode, except that if there are multiple 
 * elements in the body, this mode returns the `<body/>` element itself.
 * 
 * @prop {number} DOC - Return the `document` object itself.
 * @prop {number} HTML - Return the `<html/>` element.
 * @prop {number} BODY - Return the `<body/>` element.
 * 
 * If there is no body element, this mode will return `null`.
 * 
 */
exports.HTML_MODE = Enum(
[
  'AUTO',
  'AUTO_BODY',
  'DOC',
  'HTML',
  'BODY',
]);

/**
 * An Error indicating an invalid node.
 * @alias module:@lumjs/dom/util.InvalidNode
 */
class InvalidNode extends TypeError
{
  constructor()
  {
    super('Invalid node');
    this.name = 'InvalidNode';
  }
}

exports.InvalidNode = InvalidNode;

/**
 * Get a storage object inside an object
 * identified by a private `Symbol`.
 * 
 * @alias {module:@lumjs/dom/util.getNodeSymbol}
 * @param {object} node - The object we want stored data from.
 * @param {symbol} symbol - The private symbol for the stored data.
 * @returns {object} An object specifically for storing private data.
 */
function getNodeSymbol(node, symbol)
{
  if (typeof symbol !== SY)
  {
    throw new TypeError("Invalid symbol");
  }

  if (!isObj(node))
  {
    throw new InvalidNode();
  }

  if (!isObj(node[symbol]))
  { // Hadn't created it yet.
    node[symbol] = {};
  }

  return node[symbol];
}

exports.getNodeSymbol = getNodeSymbol;
