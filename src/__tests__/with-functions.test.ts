import { describe, it, expect, beforeEach, vi } from "vitest";
import { PriorityQueue } from "../index.js";

describe("with functions", () => {
  let pq: PriorityQueue<() => void>;
  let result: string[];

  beforeEach(() => {
    result = [];
    pq = new PriorityQueue<() => void>(true); // 最小ヒープ
  });

  it("should execute functions in min-heap order", () => {
    pq.enqueue(() => result.push("C"), 3);
    pq.enqueue(() => result.push("A"), 1);
    pq.enqueue(() => result.push("B"), 2);

    while (!pq.isEmpty()) {
      const fn = pq.dequeue();
      fn?.();
    }

    expect(result).toEqual(["A", "B", "C"]);
  });

  it("should execute functions in max-heap order after switching", () => {
    pq.setMaxHeap();

    pq.enqueue(() => result.push("low"), 1);
    pq.enqueue(() => result.push("high"), 3);
    pq.enqueue(() => result.push("medium"), 2);

    while (!pq.isEmpty()) {
      const fn = pq.dequeue();
      fn?.();
    }

    expect(result).toEqual(["high", "medium", "low"]);
  });

  it("should allow mixing functions and dynamic priority change", () => {
    pq.enqueue(() => result.push("min-1"), 1);
    pq.enqueue(() => result.push("min-2"), 2);

    pq.setMaxHeap(); // 残り2要素に reheapify がかかる
    pq.enqueue(() => result.push("max-5"), 5);
    pq.enqueue(() => result.push("max-3"), 3);

    while (!pq.isEmpty()) {
      const fn = pq.dequeue();
      fn?.();
    }

    // max-5 → max-3 → min-2 → min-1 の順になる
    expect(result).toEqual(["max-5", "max-3", "min-2", "min-1"]);
  });

  it("should safely handle undefined functions", () => {
    const fn = pq.dequeue();
    expect(fn).toBeUndefined();
    expect(() => fn?.()).not.toThrow();
  });
});
