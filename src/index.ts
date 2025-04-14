type QueueElement<T> = {
  value: T;
  priority: number;
};

type CompareFn<T> = (a: QueueElement<T>, b: QueueElement<T>) => number;

export class PriorityQueue<T> {
  #heap: QueueElement<T>[] = [];
  #compare: CompareFn<T>;

  constructor(isMinHeap = true) {
    this.#compare = isMinHeap ? (a, b) => a.priority - b.priority : (a, b) => b.priority - a.priority;
  }

  public setMinHeap(): void {
    this.#compare = (a, b) => a.priority - b.priority;
    this.#reheapify();
  }

  public setMaxHeap(): void {
    this.#compare = (a, b) => b.priority - a.priority;
    this.#reheapify();
  }

  public enqueue(value: T, priority: number): void {
    const node = { value, priority };
    this.#heap.push(node);
    this.#bubbleUp();
  }

  public dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;

    const top = this.#heap[0];
    const end = this.#heap.pop();

    if (this.#heap.length > 0 && end) {
      this.#heap[0] = end;
      this.#bubbleDown();
    }

    return top.value;
  }

  public peek(): T | undefined {
    return this.#heap[0]?.value;
  }

  public isEmpty(): boolean {
    return this.#heap.length === 0;
  }

  get size(): number {
    return this.#heap.length;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    for (const entry of this.#heap) {
      yield entry.value;
    }
  }

  *drain(): Generator<T, void, unknown> {
    while (!this.isEmpty()) {
      const value = this.dequeue();
      if (value !== undefined) {
        yield value;
      }
    }
  }

  #bubbleUp(): void {
    let index = this.#heap.length - 1;
    const element = this.#heap[index];

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.#heap[parentIndex];

      if (this.#compare(element, parent) >= 0) break;

      this.#heap[index] = parent;
      this.#heap[parentIndex] = element;
      index = parentIndex;
    }
  }

  #bubbleDown(): void {
    let index = 0;
    const length = this.#heap.length;
    const element = this.#heap[0];

    while (true) {
      const leftIndex = 2 * index + 1;
      const rightIndex = 2 * index + 2;
      let swapIndex: number | null = null;

      if (leftIndex < length) {
        const left = this.#heap[leftIndex];
        if (this.#compare(left, element) < 0) {
          swapIndex = leftIndex;
        }
      }

      if (rightIndex < length) {
        const right = this.#heap[rightIndex];
        if (
          (swapIndex === null && this.#compare(right, element) < 0) ||
          (swapIndex !== null && this.#compare(right, this.#heap[swapIndex]) < 0)
        ) {
          swapIndex = rightIndex;
        }
      }

      if (swapIndex === null) break;

      this.#heap[index] = this.#heap[swapIndex];
      this.#heap[swapIndex] = element;
      index = swapIndex;
    }
  }

  #reheapify(): void {
    // Heapify all nodes (O(n)) - optional performance tradeoff
    for (let i = Math.floor(this.#heap.length / 2); i >= 0; i--) {
      this.#bubbleDownFrom(i);
    }
  }

  #bubbleDownFrom(startIndex: number): void {
    let index = startIndex;
    const length = this.#heap.length;
    const element = this.#heap[index];

    while (true) {
      const leftIndex = 2 * index + 1;
      const rightIndex = 2 * index + 2;
      let swapIndex: number | null = null;

      if (leftIndex < length) {
        const left = this.#heap[leftIndex];
        if (this.#compare(left, element) < 0) {
          swapIndex = leftIndex;
        }
      }

      if (rightIndex < length) {
        const right = this.#heap[rightIndex];
        if (
          (swapIndex === null && this.#compare(right, element) < 0) ||
          (swapIndex !== null && this.#compare(right, this.#heap[swapIndex]) < 0)
        ) {
          swapIndex = rightIndex;
        }
      }

      if (swapIndex === null) break;

      this.#heap[index] = this.#heap[swapIndex];
      this.#heap[swapIndex] = element;
      index = swapIndex;
    }
  }
}
