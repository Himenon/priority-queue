import { PriorityQueue } from "../src/index.js";
import YoctoQueue from "yocto-queue";
import { performance } from "perf_hooks";
import * as fs from "fs";

const sizes = [1000, 5000, 10000, 50000, 100000];

type Result = {
  type: "priority" | "yocto";
  heapSize: number;
  enqueueTimeMs: number;
  dequeueTimeMs: number;
  drainTimeMs: number;
};

function measureTime<T>(fn: () => T): { durationMs: number; result: T } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { durationMs: end - start, result };
}

function benchmarkFlexiblePriorityQueue(size: number): Result {
  const pq = new PriorityQueue<number>(true);
  const data = Array.from({ length: size }, (_, i) => ({
    value: i,
    priority: Math.floor(Math.random() * size),
  }));

  const { durationMs: enqueueTimeMs } = measureTime(() => {
    for (const item of data) {
      pq.enqueue(item.value, item.priority);
    }
  });

  const { durationMs: dequeueTimeMs } = measureTime(() => {
    while (!pq.isEmpty()) {
      pq.dequeue();
    }
  });

  // 再度入れ直して drain をテスト
  for (const item of data) {
    pq.enqueue(item.value, item.priority);
  }

  const { durationMs: drainTimeMs } = measureTime(() => {
    [...pq.drain()];
  });

  return {
    type: "priority",
    heapSize: size,
    enqueueTimeMs,
    dequeueTimeMs,
    drainTimeMs,
  };
}

function benchmarkYoctoQueue(size: number): Result {
  const q = new YoctoQueue<number>();
  const data = Array.from({ length: size }, (_, i) => i);

  const { durationMs: enqueueTimeMs } = measureTime(() => {
    for (const item of data) {
      q.enqueue(item);
    }
  });

  const { durationMs: dequeueTimeMs } = measureTime(() => {
    while (q.size > 0) {
      q.dequeue();
    }
  });

  // 再度入れ直して drain をテスト
  for (const item of data) {
    q.enqueue(item);
  }

  const { durationMs: drainTimeMs } = measureTime(() => {
    [...q.drain()];
  });

  return {
    type: "yocto",
    heapSize: size,
    enqueueTimeMs,
    dequeueTimeMs,
    drainTimeMs,
  };
}

function saveCSV(results: Result[], path = "benchmark/compare.csv") {
  const header = "type,heapSize,enqueueTimeMs,dequeueTimeMs,drainTimeMs\n";
  const rows = results.map((r) => [r.type, r.heapSize, r.enqueueTimeMs, r.dequeueTimeMs, r.drainTimeMs].join(",")).join("\n");

  fs.writeFileSync(path, header + rows);
  console.log(`CSV written to ${path}`);
}

function main() {
  const results: Result[] = [];

  for (const size of sizes) {
    console.log(`Benchmarking priority queue for size = ${size}`);
    results.push(benchmarkFlexiblePriorityQueue(size));

    console.log(`Benchmarking yocto queue for size = ${size}`);
    results.push(benchmarkYoctoQueue(size));
  }

  saveCSV(results);
}

main();
