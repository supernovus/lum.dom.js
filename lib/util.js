const core = require('@lumjs/core');
const {isObj} = core.types;

/**
 * Helper constants, enums, and functions.
 * @module @lumjs/dom/util
 */

/**
 * A list of valid node types.
 * @alias module:@lumjs/dom/util.NOTE_TYPE
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
