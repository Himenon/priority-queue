import { describe, it, expect, beforeEach } from "vitest";
import { PriorityQueue } from "../index.js";

describe("FlexiblePriorityQueue: size, iterator, and drain", () => {
  let pq: PriorityQueue<string>;

  beforeEach(() => {
    pq = new PriorityQueue<string>(true); // min-heap
  });

  it("should correctly report size", () => {
    expect(pq.size).toBe(0);

    pq.enqueue("one", 1);
    pq.enqueue("two", 2);
    expect(pq.size).toBe(2);

    pq.dequeue();
    expect(pq.size).toBe(1);

    pq.dequeue();
    expect(pq.size).toBe(0);
  });

  it("iterator should yield values in heap order (not sorted)", () => {
    pq.enqueue("C", 3);
    pq.enqueue("A", 1);
    pq.enqueue("B", 2);

    const values = [...pq];
    // ヒープ構造に従うため順序保証なし（要素は存在するが順序はランダム）
    expect(values.sort()).toEqual(["A", "B", "C"]);
    expect(values.length).toBe(3);
  });

  it("drain should yield all items in priority order and empty the queue", () => {
    pq.enqueue("C", 3);
    pq.enqueue("A", 1);
    pq.enqueue("B", 2);

    const drained = [...pq.drain()];
    expect(drained).toEqual(["A", "B", "C"]); // min-heap: 優先度順

    expect(pq.isEmpty()).toBe(true);
    expect(pq.size).toBe(0);
  });

  it("drain should work on max-heap as well", () => {
    pq.setMaxHeap();

    pq.enqueue("low", 1);
    pq.enqueue("high", 3);
    pq.enqueue("mid", 2);

    const drained = [...pq.drain()];
    expect(drained).toEqual(["high", "mid", "low"]); // max-heap: 優先度高い順
  });

  it("iterator and drain should both be safe on empty queue", () => {
    const iterated = [...pq];
    const drained = [...pq.drain()];

    expect(iterated).toEqual([]);
    expect(drained).toEqual([]);
    expect(pq.size).toBe(0);
  });
});
