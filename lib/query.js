/**
 * The `Query` class.
 * 
 * This extends the functionality of `querySelector()` and `querySelectorAll()`
 * so that they can work on collections of nodes as well.
 * 
 * @exports module:@lumjs/dom/query
 */
class Query 
{
  /**
   * Build a Query instance.
   * @param {*} dom - The parent DOM helper instance.
   */
  constructor(dom)
  {
    this.dom = dom;
  }

  /**
   * Find child nodes matching a CSS selector.
   * 
   * @param {string} query - The CSS selector query.
   * @param {module:@lumjs/dom.QueryNode} [inNode=this.dom.document] - The node(s) to look in.
   *   If not specified, defaults to the top-level `document`.
   * @param {boolean} [asHTMLCollection=false] 
   *   If `true` return an `HTMLCollection` instead of a `NodeList`.
   * @returns {NodeList}
   */
  find(query, inNode=this.dom.document, asHTMLCollection=false)
  {
    const dlc = this.dom.listCompiler;
    if (this.dom.isQueryNode(inNode))
    { // A single node.
      const res = inNode.querySelectorAll(query);
      return asHTMLCollection
        ? dlc.makeHTMLCollection(res)
        : res;
    }
    else if (this.dom.isContainer(inNode))
    { // A collection of nodes.
      const found = [];
      for (const node of inNode)
      {
        if (this.dom.isQueryNode(node))
        {
          found.push(node.querySelectorAll(query));
        }
      }
      return asHTMLCollection 
        ? dlc.makeHTMLCollection(...found) 
        : dlc.makeNodeList(...found);
    }
    else
    { // Nothing valid. Return an empty NodeList.
      return asHTMLCollection
        ? dlc.makeHTMLCollection()
        : dlc.makeNodeList();
    }
  }

  /**
   * Find the first child matching a CSS selector.
   * 
   * @param {string} query - The CSS selector query.
   * @param {module:@lumjs/dom.QueryNode} [inNode=this.dom.document] - The node(s) to look in.
   *   If not specified, defaults to the top-level `document`.
   * @returns {?Node}
   */
  get(query, inNode=this.dom.document)
  {
    if (this.dom.isQueryNode(inNode))
    { // A single node.
      return inNode.querySelector(query);
    }
    else if (this.dom.isContainer(inNode))
    { // A collection of nodes.
      for (const node of inNode)
      {
        if (this.dom.isQueryNode(node))
        {
          const res = node.querySelector(query);
          if (this.dom.isNode(node))
          {
            return res;
          }
        }
      }
    }
    
    // Nothing matched.
    return null;
  }

}

module.exports = Query;
