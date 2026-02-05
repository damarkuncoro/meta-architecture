/**
 * Cache eviction policies
 */
export enum EvictionPolicy {
  LRU = 'lru', // Least Recently Used
  LFU = 'lfu', // Least Frequently Used
  FIFO = 'fifo', // First In, First Out
  TTL = 'ttl', // Time To Live
  SIZE = 'size' // Size-based
}
