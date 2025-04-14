import { describe, it, expect, beforeEach } from "vitest";
import { PriorityQueue } from "../index.js";

describe("Common usecase", () => {
  let pq: PriorityQueue<string>;

  beforeEach(() => {
    pq = new PriorityQueue<string>(true); // 初期は最小ヒープ
  });

  it("should be empty on initialization", () => {
    expect(pq.isEmpty()).toBe(true);
    expect(pq.peek()).toBeUndefined();
    expect(pq.dequeue()).toBeUndefined();
  });

  it("should enqueue and dequeue in min-heap order", () => {
    pq.enqueue("low", 3);
    pq.enqueue("medium", 2);
    pq.enqueue("high", 1);

    expect(pq.dequeue()).toBe("high");
    expect(pq.dequeue()).toBe("medium");
    expect(pq.dequeue()).toBe("low");
    expect(pq.isEmpty()).toBe(true);
  });

  it("should enqueue and dequeue in max-heap order", () => {
    pq.setMaxHeap();
    pq.enqueue("low", 1);
    pq.enqueue("medium", 2);
    pq.enqueue("high", 3);

    expect(pq.dequeue()).toBe("high");
    expect(pq.dequeue()).toBe("medium");
    expect(pq.dequeue()).toBe("low");
    expect(pq.isEmpty()).toBe(true);
  });

  it("should handle dynamic switching from min-heap to max-heap", () => {
    pq.enqueue("a", 2);
    pq.enqueue("b", 1);

    expect(pq.dequeue()).toBe("b"); // min-heap: priority 1

    pq.setMaxHeap();
    pq.enqueue("c", 5);
    pq.enqueue("d", 3);

    expect(pq.dequeue()).toBe("c"); // max-heap: priority 5
    expect(pq.dequeue()).toBe("d"); // max-heap: priority 3
    expect(pq.dequeue()).toBe("a"); // a (priority 2, from before switching)
  });

  it("peek should return the highest or lowest priority item without removing it", () => {
    pq.enqueue("first", 10);
    pq.enqueue("second", 5);

    expect(pq.peek()).toBe("second"); // min-heap: 5が先

    pq.setMaxHeap();
    pq.enqueue("third", 20);
    expect(pq.peek()).toBe("third"); // max-heap: 20が先
  });

  it("should work correctly with mixed enqueue and dequeue calls", () => {
    pq.enqueue("x", 2);
    pq.enqueue("y", 1);
    expect(pq.dequeue()).toBe("y");
    pq.enqueue("z", 0);
    expect(pq.dequeue()).toBe("z");
    expect(pq.dequeue()).toBe("x");
    expect(pq.isEmpty()).toBe(true);
  });
});
