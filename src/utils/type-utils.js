const TypeUtils = {
  isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  },

  isArrayIndex(key) {
    const num = parseInt(key);
    return String(num) === key && num >= 0;
  },

  isPrimitive(value) {
    return (
      value === null ||
      (typeof value !== "object" && typeof value !== "function")
    );
  },

  coerceType(value, targetType) {
    switch (targetType) {
      case "number":
        return Number(value);
      case "boolean":
        return Boolean(value);
      case "string":
        return String(value);
      default:
        return value;
    }
  },
};

export default TypeUtils;