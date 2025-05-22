import ClearableWeakMap from "./utils/weakmap";

class SelectorEvaluator {
  constructor(ast, options = {}) {
    this.ast = ast;
    this.options = options;
    this.valueCache = new ClearableWeakMap(); // Cache for computed values
  }

  evaluate(data) {
    this.data = data;
    this.valueCache.clear();
    return this.evaluateNode(this.ast, data);
  }

  evaluateNode(node, data) {
    // Check cache first
    const cached = this.valueCache.get(node);
    if (cached && cached.data === data) {
      return cached.result;
    }

    let result;
    switch (node.type) {
      case "LogicalExpression":
        result = this.evaluateLogicalExpression(node, data);
        break;

      case "UnaryExpression":
        result = this.evaluateUnaryExpression(node, data);
        break;

      case "PropertyChain":
        result = this.evaluatePropertyChain(node, data);
        break;

      default:
        result = undefined;
    }

    // Cache the result
    this.valueCache.set(node, { data, result });
    return result;
  }

  evaluatePropertyChain(propertyChain, data) {
    const segments = propertyChain.segments;
    let currentData = data;

    for (const segment of segments) {
      currentData = this.evaluatePropertySegment(segment, currentData);
      if (!currentData || !currentData.length) break;
    }

    return currentData;
  }

  evaluatePropertySegment(segment, dataArray) {
    switch (segment.type) {
      case "Property":
        return this.evaluateProperty(segment, dataArray);
      case "Property":
        return this.evaluateProperty(segment, dataArray);
      case "Wildcard":
        return this.evaluateWildcard(segment, dataArray);
      case "DeepWildcard":
        return this.evaluateDeepWildcard(segment, dataArray);
      default:
        return [];
    }
  }

  evaluateProperty(segment, dataArray) {
    const result = [];
    const hasFilter = segment.filter !== undefined;
    const hasSlice = segment.slice !== undefined;

    for (const data of dataArray) {
      if (data == null) continue;

      let value = data[segment.name];
      if (value === undefined) continue;

      if (hasFilter) {
        value = this.applyFilter(segment.filter, value);
      }

      if (hasSlice && Array.isArray(value)) {
        value = this.applySlice(segment.slice, value);
      }

      if (Array.isArray(value)) {
        result.push(...value);
      } else {
        result.push(value);
      }
    }
  }

  evaluateLogicalExpression(expr, data) {
    const left = this.evaluateNode(expr.left, data);

    // Short-circuit evaluation
    if (expr.operator === "AND" && !this.isTruthy(left)) {
      return this.normalizeResult([]);
    }
    if (expr.operator === "OR" && this.isTruthy(left)) {
      return this.normalizeResult(left);
    }

    const right = this.evaluateNode(expr.right, data);

    return expr.operator === "AND"
      ? this.intersectResults(left, right)
      : this.unionResults(left, right);
  }

  isTruthy(value) {
    return Array.isArray(value) ? value.length > 0 : !!value;
  }

  intersectResults(left, right) {
    const leftArr = this.normalizeResult(left);
    const rightArr = this.normalizeResult(right);

    // Use Set for faster intersection
    const rightSet = new Set(rightArr);
    return leftArr.filter((item) => rightSet.has(item));
  }

  unionResults(left, right) {
    const leftArr = this.normalizeResult(left);
    const rightArr = this.normalizeResult(right);

    // Use Set for faster union
    return [...new Set([...leftArr, ...rightArr])];
  }

  normalizeResult(value) {
    if (Array.isArray(value)) return value;
    if (value === undefined) return [];
    return [value];
  }
}

export default SelectorEvaluator;
