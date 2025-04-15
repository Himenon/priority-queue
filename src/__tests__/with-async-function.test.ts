import { beforeEach, describe, expect, it } from "vitest";
import { PriorityQueue } from "../index.js";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("PriorityQueue with async functions", () => {
  let pq: PriorityQueue<() => Promise<void>>;
  let result: string[];

  beforeEach(() => {
    pq = new PriorityQueue<() => Promise<void>>(true); // min-heap
    result = [];
  });

  it("should execute async functions in min-heap order", async () => {
    pq.enqueue(async () => {
      await delay(10);
      result.push("C");
    }, 3);

    pq.enqueue(async () => {
      await delay(5);
      result.push("A");
    }, 1);

    pq.enqueue(async () => {
      await delay(1);
      result.push("B");
    }, 2);

    while (!pq.isEmpty()) {
      const fn = pq.dequeue();
      if (fn) await fn(); // await async function
    }

    expect(result).toEqual(["A", "B", "C"]);
  });

  it("should work with drain and async/await", async () => {
    pq.enqueue(async () => {
      result.push("1");
    }, 1);
    pq.enqueue(async () => {
      result.push("0");
    }, 0);

    for (const fn of pq.drain()) {
      await fn();
    }

    expect(result).toEqual(["0", "1"]);
  });

  it("should support switching to max-heap for async tasks", async () => {
    pq.setMaxHeap();

    pq.enqueue(async () => {
      result.push("low");
    }, 1);
    pq.enqueue(async () => {
      result.push("mid");
    }, 2);
    pq.enqueue(async () => {
      result.push("high");
    }, 3);

    for (const fn of pq.drain()) {
      await fn();
    }

    expect(result).toEqual(["high", "mid", "low"]);
  });

  it("should not throw on empty dequeue of async functions", async () => {
    const fn = pq.dequeue();
    expect(fn).toBeUndefined();
    // no exception even if we await undefined
    await Promise.resolve();
  });
});
