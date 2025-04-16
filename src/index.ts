// --- Helper Types (Not Exported) ---

/**
 * @internal
 * Represents an element within the priority queue, containing the value and its priority.
 */
type QueueElement<T> = {
  value: T;
  priority: number;
};

/**
 * @internal
 * Type definition for the comparison function used to order elements in the heap.
 * Should return:
 * - A negative value if `a` should come before `b`.
 * - A positive value if `a` should come after `b`.
 * - Zero if their order doesn't matter (or they are equal).
 */
type CompareFn<T> = (a: QueueElement<T>, b: QueueElement<T>) => number;

// --- PriorityQueue Class ---

/**
 * Represents a priority queue implemented using a binary heap.
 * Allows adding elements with priorities and retrieving the element
 * with the highest (or lowest) priority efficiently.
 *
 * @template T The type of elements stored in the queue.
 */
export class PriorityQueue<T> {
  /** @internal The binary heap storing queue elements. */
  #heap: QueueElement<T>[] = [];
  /** @internal The comparison function determining heap order (min or max). */
  #compare: CompareFn<T>;

  /**
   * Creates an instance of PriorityQueue.
   *
   * By default, it creates a min-heap (lower priority values are prioritized).
   * For a max-heap (higher priority values are prioritized), set `isMinHeap` to `false`.
   *
   * @param {boolean} [isMinHeap=true] If true, the queue behaves as a min-heap.
   * If false, it behaves as a max-heap.
   *
   * @example
   * // Create a min-heap (default)
   * const minQueue = new PriorityQueue<string>();
   * minQueue.enqueue("Task A", 10);
   * minQueue.enqueue("Task B", 5);
   * console.log(minQueue.dequeue()); // Output: "Task B"
   *
   * @example
   * // Create a max-heap
   * const maxQueue = new PriorityQueue<string>(false);
   * maxQueue.enqueue("Task C", 10);
   * maxQueue.enqueue("Task D", 5);
   * console.log(maxQueue.dequeue()); // Output: "Task C"
   */
  constructor(isMinHeap = true) {
    // Note: Could be extended to accept a custom CompareFn<T> for more complex scenarios.
    this.#compare = isMinHeap ? PriorityQueue.#minCompare : PriorityQueue.#maxCompare;
  }

  /** @internal Default comparison function for a min-heap. */
  static #minCompare = <T>(a: QueueElement<T>, b: QueueElement<T>): number => a.priority - b.priority;
  /** @internal Default comparison function for a max-heap. */
  static #maxCompare = <T>(a: QueueElement<T>, b: QueueElement<T>): number => b.priority - a.priority;

  /**
   * Configures the queue to operate as a min-heap (lowest priority first).
   * Re-organizes the existing elements if necessary.
   * Complexity: O(n) where n is the number of elements.
   */
  public setMinHeap(): void {
    if (this.#compare !== PriorityQueue.#minCompare) {
      this.#compare = PriorityQueue.#minCompare;
      this.#reheapify();
    }
  }

  /**
   * Configures the queue to operate as a max-heap (highest priority first).
   * Re-organizes the existing elements if necessary.
   * Complexity: O(n) where n is the number of elements.
   */
  public setMaxHeap(): void {
    if (this.#compare !== PriorityQueue.#maxCompare) {
      this.#compare = PriorityQueue.#maxCompare;
      this.#reheapify();
    }
  }

  /**
   * Adds an element to the queue with a given priority.
   * Complexity: O(log n)
   * @param {T} value The value to add.
   * @param {number} priority The priority of the element (lower values are higher priority in a min-heap, higher values in a max-heap).
   */
  public enqueue(value: T, priority: number): void {
    const node: QueueElement<T> = { value, priority };
    this.#heap.push(node);
    this.#bubbleUp();
  }

  /**
   * Removes and returns the element with the highest priority (lowest value in min-heap, highest value in max-heap).
   * Returns `undefined` if the queue is empty.
   * Complexity: O(log n)
   * @returns {T | undefined} The element with the top priority, or undefined if empty.
   */
  public dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    const top = this.#heap[0];
    const last = this.#heap.pop(); // Remove the last element

    // If there are elements left after removing the top and last
    if (this.#heap.length > 0 && last !== undefined) {
      this.#heap[0] = last; // Move the last element to the top
      this.#bubbleDown(0); // Restore heap property from the root
    }

    return top.value;
  }

  /**
   * Returns the element with the highest priority without removing it from the queue.
   * Returns `undefined` if the queue is empty.
   * Complexity: O(1)
   * @returns {T | undefined} The element with the top priority, or undefined if empty.
   */
  public peek(): T | undefined {
    return this.#heap[0]?.value;
  }

  /**
   * Checks if the priority queue is empty.
   * Complexity: O(1)
   * @returns {boolean} `true` if the queue is empty, `false` otherwise.
   */
  public isEmpty(): boolean {
    return this.#heap.length === 0;
  }

  /**
   * Gets the number of elements currently in the priority queue.
   * Complexity: O(1)
   * @returns {number} The size of the queue.
   */
  get size(): number {
    return this.#heap.length;
  }

  /**
   * Returns an iterator that yields elements in priority order.
   * This method creates a temporary copy of the queue and does not modify the original.
   * Complexity: O(n log n) for full iteration, O(n) space for the copy.
   *
   * @yields {T} Elements in priority order.
   *
   * @example
   * const queue = new PriorityQueue<string>();
   * queue.enqueue("C", 3);
   * queue.enqueue("A", 1);
   * queue.enqueue("B", 2);
   *
   * for (const item of queue) {
   * console.log(item); // Outputs: "A", "B", "C" (in priority order)
   * }
   * console.log(queue.size) // Output: 3 (original queue is unchanged)
   */
  *[Symbol.iterator](): IterableIterator<T> {
    // Create a temporary copy to avoid modifying the original queue
    const clone = new PriorityQueue<T>();
    // Use structuredClone for potentially complex objects, or spread for simple cases
    // Be cautious if T contains non-cloneable items (functions, DOM nodes etc.)
    try {
      clone.#heap = structuredClone(this.#heap);
    } catch (e) {
      // Fallback for non-structured-cloneable elements, might share references
      console.warn("PriorityQueue: Element type might not be structured-cloneable, using shallow copy for iterator.", e);
      clone.#heap = [...this.#heap];
    }
    clone.#compare = this.#compare;

    // Yield elements by dequeuing from the clone
    while (!clone.isEmpty()) {
      const value = clone.dequeue(); // Dequeue from the clone
      if (value !== undefined) {
        yield value;
      }
    }
  }

  /**
   * Removes and yields all elements from the queue in priority order.
   * The queue will be empty after this operation (destructive).
   * This is useful for processing all elements in order.
   * Complexity: O(n log n)
   *
   * @yields {T} Elements in priority order.
   *
   * @example
   * const queue = new PriorityQueue<number>();
   * queue.enqueue(10, 1);
   * queue.enqueue(30, 3);
   * queue.enqueue(20, 2);
   *
   * const drained = [];
   * for (const item of queue.drain()) {
   * drained.push(item);
   * }
   * console.log(drained); // Output: [10, 20, 30]
   * console.log(queue.isEmpty()); // Output: true
   */
  *drain(): Generator<T, void, unknown> {
    while (!this.isEmpty()) {
      const value = this.dequeue(); // Dequeue from the original queue
      if (value !== undefined) {
        yield value;
      }
    }
  }

  /**
   * Removes all elements and returns them sorted by priority.
   * This performs sorting in O(n log n) time, which might be faster
   * overall than calling `dequeue` repeatedly via `drain()` or the iterator,
   * due to potentially better constant factors in native sort.
   * The queue will be empty after this operation (destructive).
   * Complexity: O(n log n)
   *
   * @returns {T[]} An array of elements sorted according to the queue's priority rules.
   */
  public drainFast(): T[] {
    // Sort a copy of the heap using the internal comparison function
    const sorted = [...this.#heap].sort(this.#compare);
    this.#heap = []; // Clear the original heap
    return sorted.map((item) => item.value); // Extract values
  }

  // --- Private Helper Methods ---

  /**
   * @internal
   * Moves the last added element up the heap to maintain the heap property.
   * Complexity: O(log n)
   */
  #bubbleUp(): void {
    let index = this.#heap.length - 1;
    const element = this.#heap[index];
    const compare = this.#compare; // Cache compare function for potential micro-optimization

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.#heap[parentIndex];

      // If element's priority is not higher than parent's, stop
      if (compare(element, parent) >= 0) {
        break;
      }

      // Swap element with parent
      this.#heap[index] = parent;
      index = parentIndex;
    }
    // Place the element in its correct position
    this.#heap[index] = element;
  }

  /**
   * @internal
   * Moves an element down the heap from a given start index to maintain the heap property.
   * Used after removing the top element (dequeue) or when rebuilding the heap (reheapify).
   * Complexity: O(log n)
   * @param {number} startIndex The index to start bubbling down from.
   */
  #bubbleDown(startIndex: number): void {
    const length = this.#heap.length;
    if (startIndex >= length) return; // Index out of bounds

    const element = this.#heap[startIndex];
    const compare = this.#compare; // Cache compare function
    let index = startIndex;

    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let swapTargetIndex = index; // Assume current index is the correct spot initially

      // Check left child: if it exists and has higher priority than the current swap target
      if (leftChildIndex < length && compare(this.#heap[leftChildIndex], this.#heap[swapTargetIndex]) < 0) {
        swapTargetIndex = leftChildIndex;
      }

      // Check right child: if it exists and has higher priority than the current swap target
      if (rightChildIndex < length && compare(this.#heap[rightChildIndex], this.#heap[swapTargetIndex]) < 0) {
        swapTargetIndex = rightChildIndex;
      }

      // If the swap target hasn't changed, the element is in the correct position
      if (swapTargetIndex === index) {
        break;
      }

      // Swap the element at the current index with the higher priority child
      this.#heap[index] = this.#heap[swapTargetIndex];
      index = swapTargetIndex; // Move down to the child's position
    }

    // Place the original element (the one being bubbled down) in its final correct position
    // Only write if the index actually changed from the start to avoid unnecessary write
    if (index !== startIndex) {
      this.#heap[index] = element;
    } else if (this.#heap[startIndex] !== element) {
      // This case handles when the element was moved to the top (in dequeue)
      // but didn't need to bubble down further. Ensure it's placed correctly.
      this.#heap[startIndex] = element;
    }
    // Optimization: If the element never moved, we don't need to write it back.
    // However, in dequeue, the element at startIndex was overwritten by 'last',
    // so we MUST write 'element' back if index === startIndex.
    this.#heap[index] = element; // Simplified: Always write back, covers all cases.
  }

  /**
   * @internal
   * Rebuilds the heap from the internal array. Ensures the heap property is satisfied
   * for all elements. Called when switching between min/max heap.
   * Complexity: O(n) - More efficient than inserting n elements one by one.
   */
  #reheapify(): void {
    // Start from the last non-leaf node and bubble down each node
    const lastNonLeafIndex = Math.floor(this.#heap.length / 2) - 1;
    for (let i = lastNonLeafIndex; i >= 0; i--) {
      this.#bubbleDown(i);
    }
  }
}
