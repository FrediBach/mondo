class SelectorCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.lru = new Array(maxSize);
    this.currentSize = 0;
  }

  get(selector) {
    const entry = this.cache.get(selector);
    if (entry) {
      entry.lastUsed = Date.now();
      return entry.evaluator;
    }
    return null;
  }

  set(selector, evaluator) {
    if (this.currentSize >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(selector, {
      evaluator,
      lastUsed: Date.now(),
    });
    this.currentSize++;
  }

  evictOldest() {
    let oldest = Infinity;
    let oldestKey = null;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastUsed < oldest) {
        oldest = entry.lastUsed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.currentSize--;
    }
  }
}

export default SelectorCache;
