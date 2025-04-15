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

  /**
   * drainFast: 優先度順で全て取り出すが、dequeue() を使わず O(n log n) を一括で行う
   */
  public drainFast(): T[] {
    const sorted = [...this.#heap].sort(this.#compare);
    this.#heap = [];
    return sorted.map((item) => item.value);
  }

  #bubbleUp(): void {
    let index = this.#heap.length - 1;
    const element = this.#heap[index];
    const compare = this.#compare;

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.#heap[parentIndex];

      if (compare(element, parent) >= 0) break;

      this.#heap[index] = parent;
      index = parentIndex;
    }

    this.#heap[index] = element;
  }

  #bubbleDown(): void {
    const length = this.#heap.length;
    const element = this.#heap[0];
    const compare = this.#compare;
    let index = 0;

    while (true) {
      const leftIndex = 2 * index + 1;
      const rightIndex = 2 * index + 2;
      let smallest = index;

      if (leftIndex < length && compare(this.#heap[leftIndex], this.#heap[smallest]) < 0) {
        smallest = leftIndex;
      }

      if (rightIndex < length && compare(this.#heap[rightIndex], this.#heap[smallest]) < 0) {
        smallest = rightIndex;
      }

      if (smallest === index) break;

      this.#heap[index] = this.#heap[smallest];
      index = smallest;
    }

    this.#heap[index] = element;
  }

  #reheapify(): void {
    for (let i = Math.floor(this.#heap.length / 2) - 1; i >= 0; i--) {
      this.#bubbleDownFrom(i);
    }
  }

  #bubbleDownFrom(startIndex: number): void {
    if (!this.#heap[startIndex]) return;
    const length = this.#heap.length;
    const element = this.#heap[startIndex];
    const compare = this.#compare;
    let index = startIndex;

    while (true) {
      const leftIndex = 2 * index + 1;
      const rightIndex = 2 * index + 2;
      let smallest = index;

      if (leftIndex < length && compare(this.#heap[leftIndex], this.#heap[smallest]) < 0) {
        smallest = leftIndex;
      }

      if (rightIndex < length && compare(this.#heap[rightIndex], this.#heap[smallest]) < 0) {
        smallest = rightIndex;
      }

      if (smallest === index) break;

      this.#heap[index] = this.#heap[smallest];
      index = smallest;
    }

    this.#heap[index] = element;
  }
}
