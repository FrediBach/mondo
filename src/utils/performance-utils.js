const PerformanceUtils = {
  // Measure execution time
  measureTime(fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return { result, time: end - start };
  },

  // Memory usage optimization
  optimizeArray(arr) {
    return Array.isArray(arr) && arr.length === 1 ? arr[0] : arr;
  },

  // Batch processing for large datasets
  processBatch(items, batchSize, processFn) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      results.push(...processFn(batch));
    }
    return results;
  },
};

export default PerformanceUtils;