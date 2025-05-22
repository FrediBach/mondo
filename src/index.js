import SelectorParser from "./parser";
import SelectorEvaluator from "./evaluator";
import SelectorCache from "./cache";

const cache = new SelectorCache(1000); // Cache size of 1000 entries

/**
 * Select values from a data structure using a selector string
 * @param {string} selector - The selector string
 * @param {any} data - The data to select from
 * @param {Object} options - Optional configuration
 * @returns {any|undefined} The selected value(s) or undefined if not found
 */
function select(selector, data, options = {}) {
  try {
    // Check cache first
    const cached = cache.get(selector);
    if (cached) {
      return cached.evaluate(data);
    }

    // Parse and cache
    const parser = new SelectorParser(selector);
    const ast = parser.parse();
    const evaluator = new SelectorEvaluator(ast, options);

    cache.set(selector, evaluator);
    return evaluator.evaluate(data);
  } catch (error) {
    console.log({error});
    return undefined;
  }
}

export default select;
