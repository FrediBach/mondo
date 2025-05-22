import FilterEvaluator from "./filter.js";

class PropertyChainEvaluator {
  constructor(options = {}) {
    this.options = options;
    this.filterEvaluator = new FilterEvaluator();
    this.pathCache = new Map();
  }

  evaluate(chain, data) {
    return this.evaluateSegments(chain.segments, [data]);
  }

  evaluateSegments(segments, currentData) {
    for (const segment of segments) {
      currentData = this.evaluateSegment(segment, currentData);
      if (!currentData || !currentData.length) break;
    }
    return currentData;
  }

  evaluateSegment(segment, dataArray) {
    switch (segment.type) {
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

    for (let data of dataArray) {
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

    return result;
  }

  applyFilter(filter, data) {
    if (!Array.isArray(data)) return undefined;
    return data.filter((item) =>
      this.filterEvaluator.evaluateFilter(filter, item)
    );
  }

  applySlice(slice, array) {
    const { start = 0, end = array.length, step = 1 } = slice;
    const normalizedStart = start < 0 ? array.length + start : start;
    const normalizedEnd = end < 0 ? array.length + end : end;

    const result = [];
    for (let i = normalizedStart; i < normalizedEnd; i += Math.abs(step)) {
      result.push(array[i]);
    }
    return step < 0 ? result.reverse() : result;
  }

  evaluateWildcard(segment, dataArray) {
    const result = [];

    for (const data of dataArray) {
      if (data == null) continue;

      if (Array.isArray(data)) {
        result.push(...data);
      } else if (typeof data === "object") {
        result.push(...Object.values(data));
      }
    }

    return segment.filter
      ? result.filter((item) =>
          this.filterEvaluator.evaluateFilter(segment.filter, item)
        )
      : result;
  }

  evaluateDeepWildcard(segment, dataArray) {
    const result = new Set(); // Use Set for deduplication

    const traverse = (data) => {
      if (data == null) return;

      if (
        segment.filter &&
        this.filterEvaluator.evaluateFilter(segment.filter, data)
      ) {
        result.add(data);
      }

      if (Array.isArray(data)) {
        data.forEach(traverse);
      } else if (typeof data === "object") {
        Object.values(data).forEach(traverse);
      }
    };

    dataArray.forEach(traverse);
    return Array.from(result);
  }
}

export default PropertyChainEvaluator;