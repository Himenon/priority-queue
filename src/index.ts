type Entry<T> = { value: T; priority: number };
type CompareFn<T> = (a: Entry<T>, b: Entry<T>) => number;

export class PriorityQueue<T> {
  private heap: Entry<T>[] = [];
  private compare: CompareFn<T>;

  constructor(isMinHeap = true) {
    this.compare = isMinHeap ? (a, b) => a.priority - b.priority : (a, b) => b.priority - a.priority;
  }

  setMinHeap(): void {
    this.compare = (a, b) => a.priority - b.priority;
    this.reheapify();
  }

  setMaxHeap(): void {
    this.compare = (a, b) => b.priority - a.priority;
    this.reheapify();
  }

  enqueue(value: T, priority: number): void {
    const node = { value, priority };
    this.heap.push(node);
    this.bubbleUp();
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;

    const top = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end) {
      this.heap[0] = end;
      this.bubbleDown();
    }

    return top.value;
  }

  drain(): T[] {
    const sorted = this.heap.slice().sort(this.compare);
    this.heap.length = 0;
    return sorted.map((e) => e.value);
  }

  peek(): T | undefined {
    return this.heap[0]?.value;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    for (const entry of this.heap) {
      yield entry.value;
    }
  }

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(): void {
    let idx = this.heap.length - 1;
    const element = this.heap[idx];
    const cmp = this.compare;

    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const parent = this.heap[parentIdx];
      if (cmp(element, parent) >= 0) break;
      this.heap[idx] = parent;
      idx = parentIdx;
    }

    this.heap[idx] = element;
  }

  private bubbleDown(): void {
    const length = this.heap.length;
    const cmp = this.compare;
    const element = this.heap[0];
    let idx = 0;

    while (true) {
      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;
      let swapIdx = idx;

      if (leftIdx < length && cmp(this.heap[leftIdx], this.heap[swapIdx]) < 0) {
        swapIdx = leftIdx;
      }

      if (rightIdx < length && cmp(this.heap[rightIdx], this.heap[swapIdx]) < 0) {
        swapIdx = rightIdx;
      }

      if (swapIdx === idx) break;

      // swap without intermediate write
      this.heap[idx] = this.heap[swapIdx];
      idx = swapIdx;
    }

    this.heap[idx] = element;
  }

  private reheapify(): void {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.bubbleDownFrom(i);
    }
  }

  private bubbleDownFrom(startIndex: number): void {
    const length = this.heap.length;
    const element = this.heap[startIndex];
    const cmp = this.compare;
    let idx = startIndex;

    while (true) {
      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;
      let smallest = idx;

      if (leftIdx < length && cmp(this.heap[leftIdx], this.heap[smallest]) < 0) {
        smallest = leftIdx;
      }

      if (rightIdx < length && cmp(this.heap[rightIdx], this.heap[smallest]) < 0) {
        smallest = rightIdx;
      }

      if (smallest === idx) break;

      this.heap[idx] = this.heap[smallest];
      idx = smallest;
    }

    this.heap[idx] = element;
  }
}
