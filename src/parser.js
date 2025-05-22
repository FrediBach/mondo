import Tokenizer from "./tokenizer.js";

class SelectorParser {
  constructor(selector) {
    this.tokenizer = new Tokenizer(selector);
    this.tokens = [];
    this.pos = 0;
    this.length = 0;
  }

  parse() {
    this.tokens = this.tokenizer.tokenize();
    this.length = this.tokens.length;
    return this.parseLogicalExpression();
  }

  parseLogicalExpression() {
    const expressions = [this.parseUnary()];
    const operators = [];

    while (this.pos < this.length) {
      const token = this.peek();

      if (token.type === "AND" || token.type === "OR") {
        operators.push(token.type);
        this.pos++;
        expressions.push(this.parseUnary());
      } else {
        break;
      }
    }

    // Optimize single expression case
    if (expressions.length === 1) {
      return expressions[0];
    }

    // Process AND operators first
    let i = 0;
    while (i < operators.length) {
      if (operators[i] === "AND") {
        expressions[i] = {
          type: "LogicalExpression",
          operator: "AND",
          left: expressions[i],
          right: expressions[i + 1],
        };
        expressions.splice(i + 1, 1);
        operators.splice(i, 1);
      } else {
        i++;
      }
    }

    // Process remaining OR operators
    let result = expressions[0];
    for (i = 0; i < operators.length; i++) {
      result = {
        type: "LogicalExpression",
        operator: "OR",
        left: result,
        right: expressions[i + 1],
      };
    }

    return result;
  }

  parseUnary() {
    if (this.match("NOT")) {
      return {
        type: "UnaryExpression",
        operator: "NOT",
        expression: this.parseUnary(),
      };
    }

    if (this.match("LEFT_PAREN")) {
      const expr = this.parseLogicalExpression();
      this.consume("RIGHT_PAREN", "Expected ')'");
      return expr;
    }

    return this.parsePropertyChain();
  }

  parsePropertyChain() {
    const segments = [];
    let current = null;

    while (this.pos < this.length) {
      const token = this.peek();

      switch (token.type) {
        case "PROPERTY":
          current = {
            type: "Property",
            name: this.advance().value,
          };
          segments.push(current);
          break;

        case "WILDCARD":
          segments.push({ type: "Wildcard" });
          this.pos++;
          break;

        case "DEEP_WILDCARD":
          segments.push({ type: "DeepWildcard" });
          this.pos++;
          break;

        case "FILTER":
          if (!current) throw new Error("Filter without property");
          current.filter = this.parseFilter(this.advance().value);
          break;

        case "SLICE":
          if (!current) throw new Error("Slice without property");
          current.slice = this.advance().value;
          break;

        case "DOT":
          this.pos++;
          continue;

        default:
          return {
            type: "PropertyChain",
            segments: segments,
          };
      }
    }

    return {
      type: "PropertyChain",
      segments: segments,
    };
  }

  parseFilter(filterStr) {
    // Cache common operators
    const operators = {
      "=": "eq",
      ">": "gt",
      "<": "lt",
      ">=": "gte",
      "<=": "lte",
      "~": "regex",
    };

    for (const [op, type] of Object.entries(operators)) {
      const parts = filterStr.split(op);
      if (parts.length === 2) {
        return {
          type: "ComparisonFilter",
          operator: type,
          property: parts[0].trim(),
          value: this.parseFilterValue(parts[1].trim()),
        };
      }
    }

    return {
      type: "ExistenceFilter",
      property: filterStr.trim(),
    };
  }

  parseFilterValue(value) {
    // Fast type checks without regex
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "null") return null;
    if (value === "undefined") return undefined;

    // Number check
    if (
      value.charAt(0) === "-" ||
      (value.charAt(0) >= "0" && value.charAt(0) <= "9")
    ) {
      const num = parseFloat(value);
      if (!isNaN(num)) return num;
    }

    // Remove quotes if present
    return value.charAt(0) === '"' || value.charAt(0) === "'"
      ? value.slice(1, -1)
      : value;
  }

  match(type) {
    if (this.check(type)) {
      this.pos++;
      return true;
    }
    return false;
  }

  check(type) {
    return this.pos < this.length && this.peek().type === type;
  }

  peek() {
    return this.tokens[this.pos];
  }

  advance() {
    return this.tokens[this.pos++];
  }

  consume(type, message) {
    if (this.check(type)) return this.advance();
    throw new Error(message);
  }
}

export default SelectorParser;