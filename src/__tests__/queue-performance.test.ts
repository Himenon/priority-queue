import { describe, it, expect } from "vitest";
import { PriorityQueue } from "../index.js";

function measureTime<T>(fn: () => T): { durationMs: number; result: T } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { durationMs: end - start, result };
}

describe("FlexiblePriorityQueue Performance", () => {
  const N = 100_000;

  it(`enqueue and dequeue ${N} items in under 500ms`, () => {
    const pq = new PriorityQueue<number>(true);

    const enqueueResult = measureTime(() => {
      for (let i = 0; i < N; i++) {
        pq.enqueue(i, Math.floor(Math.random() * N));
      }
    });

    expect(enqueueResult.durationMs).toBeLessThan(300); // 許容時間（ms）

    const dequeueResult = measureTime(() => {
      let count = 0;
      while (!pq.isEmpty()) {
        pq.dequeue();
        count++;
      }
      return count;
    });

    expect(dequeueResult.durationMs).toBeLessThan(300);
    expect(dequeueResult.result).toBe(N);
  });

  it(`reheapify (min→max) of ${N} items in under 300ms`, () => {
    const pq = new PriorityQueue<number>(true);
    for (let i = 0; i < N; i++) {
      pq.enqueue(i, Math.floor(Math.random() * N));
    }

    const { durationMs } = measureTime(() => {
      pq.setMaxHeap(); // reheapify 発生
    });

    expect(durationMs).toBeLessThan(300);
  });

  it(`drain ${N} items in under 400ms`, () => {
    const pq = new PriorityQueue<number>(true);
    for (let i = 0; i < N; i++) {
      pq.enqueue(i, Math.floor(Math.random() * N));
    }

    const { durationMs, result } = measureTime(() => {
      return [...pq.drain()];
    });

    expect(result.length).toBe(N);
    expect(durationMs).toBeLessThan(400);
  });
});
