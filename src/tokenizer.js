class Tokenizer {
  constructor(selector) {
    this.selector = selector;
    this.tokens = new Array(selector.length); // Pre-allocate token array
    this.pos = 0;
    this.tokenCount = 0;
  }

  tokenize() {
    const length = this.selector.length;
    while (this.pos < length) {
      this.tokenizeNext();
    }
    return this.tokens.slice(0, this.tokenCount);
  }

  tokenizeNext() {
    const char = this.selector[this.pos];

    switch (char) {
      case ".":
        this.addToken("DOT");
        this.pos++;
        break;

      case "[":
        this.tokenizeSquareBracket();
        break;

      case "(":
        this.addToken("LEFT_PAREN");
        this.pos++;
        break;

      case ")":
        this.addToken("RIGHT_PAREN");
        this.pos++;
        break;

      case "&":
        this.addToken("AND");
        this.pos++;
        break;

      case "|":
        this.addToken("OR");
        this.pos++;
        break;

      case "!":
        this.addToken("NOT");
        this.pos++;
        break;

      case "*":
        if (this.peek() === "*") {
          this.addToken("DEEP_WILDCARD");
          this.pos += 2;
        } else {
          this.addToken("WILDCARD");
          this.pos++;
        }
        break;

      case " ":
      case "\t":
      case "\n":
      case "\r":
        this.pos++;
        break;

      default:
        if (this.isIdentifierStart(char)) {
          this.tokenizeIdentifier();
        } else {
          this.pos++; // Skip invalid characters
        }
    }
  }

  tokenizeSquareBracket() {
    const start = ++this.pos; // Skip [
    let depth = 1;

    while (this.pos < this.selector.length) {
      const char = this.selector[this.pos];
      if (char === "]" && --depth === 0) break;
      if (char === "[") depth++;
      this.pos++;
    }

    const content = this.selector.slice(start, this.pos);
    this.pos++; // Skip ]

    if (this.isSlice(content)) {
      this.addToken("SLICE", this.parseSlice(content));
    } else {
      this.addToken("FILTER", content);
    }
  }

  addToken(type, value = null) {
    this.tokens[this.tokenCount++] = { type, value };
  }

  isIdentifierStart(char) {
    return /[a-zA-Z_$]/.test(char);
  }

  isIdentifierPart(char) {
    return /[a-zA-Z0-9_$]/.test(char);
  }

  peek(offset = 1) {
    return this.selector[this.pos + offset] || "";
  }

  isSlice(content) {
    return /^\s*-?\d*\s*:\s*-?\d*\s*(?::\s*-?\d*\s*)?$/.test(content);
  }

  parseSlice(content) {
    const [start, end, step = "1"] = content.split(":").map((s) => {
      s = s.trim();
      return s === "" ? undefined : parseInt(s, 10);
    });
    return { start, end, step: parseInt(step, 10) };
  }

  tokenizeIdentifier() {
    const start = this.pos;
    while (
      this.pos < this.selector.length &&
      this.isIdentifierPart(this.selector[this.pos])
    ) {
      this.pos++;
    }
    this.addToken("PROPERTY", this.selector.slice(start, this.pos));
  }
}

export default Tokenizer;