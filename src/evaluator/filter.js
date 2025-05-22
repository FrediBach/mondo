class FilterEvaluator {
  constructor() {
    // Compile common regex patterns
    this.numberPattern = /^-?\d+(\.\d+)?$/;
    this.operatorCache = new Map();
  }

  evaluateFilter(filter, data) {
    switch (filter.type) {
      case "ComparisonFilter":
        return this.evaluateComparison(filter, data);
      case "ExistenceFilter":
        return this.evaluateExistence(filter, data);
      default:
        return false;
    }
  }

  evaluateComparison(filter, data) {
    const value = this.resolvePath(data, filter.property);
    const compareValue = filter.value;

    // Get cached operator function
    let opFunc = this.operatorCache.get(filter.operator);
    if (!opFunc) {
      opFunc = this.createOperatorFunction(filter.operator);
      this.operatorCache.set(filter.operator, opFunc);
    }

    return opFunc(value, compareValue);
  }

  createOperatorFunction(operator) {
    switch (operator) {
      case "eq":
        return (a, b) => a === b;
      case "gt":
        return (a, b) => a > b;
      case "lt":
        return (a, b) => a < b;
      case "gte":
        return (a, b) => a >= b;
      case "lte":
        return (a, b) => a <= b;
      case "regex":
        return (a, b) => {
          const regex = this.getRegexFromCache(b);
          return regex.test(String(a));
        };
      default:
        return () => false;
    }
  }

  // Regex cache
  #regexCache = new Map();

  getRegexFromCache(pattern) {
    let regex = this.#regexCache.get(pattern);
    if (!regex) {
      regex = new RegExp(pattern);
      this.#regexCache.set(pattern, regex);
    }
    return regex;
  }

  resolvePath(obj, path) {
    const parts = path.split(".");
    let current = obj;

    for (let i = 0; i < parts.length; i++) {
      if (current == null) return undefined;
      current = current[parts[i]];
    }

    return current;
  }

  evaluateExistence(filter, data) {
    return this.resolvePath(data, filter.property) !== undefined;
  }
}

export default FilterEvaluator;