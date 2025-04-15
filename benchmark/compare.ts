import { PriorityQueue } from "../src";
import YoctoQueue from "yocto-queue";
import { performance } from "perf_hooks";
import * as fs from "fs";

const sizes = [1000, 5000, 10000, 50000, 100000, 200000, 500000, 1000000];

type Result = {
  heapSize: number;
  enqueueTimeMs: number;
  dequeueTimeMs: number;
  drainTimeMs: number;
  memoryMB: number;
};

function measureTime<T>(fn: () => T): { durationMs: number; result: T } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { durationMs: end - start, result };
}

function memoryInMB(): number {
  const mem = process.memoryUsage().heapUsed;
  return Math.round((mem / 1024 / 1024) * 100) / 100;
}

function benchmarkPriorityQueue(size: number): Result {
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

  for (const item of data) {
    pq.enqueue(item.value, item.priority);
  }

  const { durationMs: drainTimeMs } = measureTime(() => {
    [...pq.drain()];
  });

  const memoryMB = memoryInMB();

  return {
    heapSize: size,
    enqueueTimeMs,
    dequeueTimeMs,
    drainTimeMs,
    memoryMB,
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

  for (const item of data) {
    q.enqueue(item);
  }

  const { durationMs: drainTimeMs } = measureTime(() => {
    [...q.drain()];
  });

  const memoryMB = memoryInMB();

  return {
    heapSize: size,
    enqueueTimeMs,
    dequeueTimeMs,
    drainTimeMs,
    memoryMB,
  };
}

function saveCSV(results: Result[], path: string) {
  const header = "heapSize,enqueueTimeMs,dequeueTimeMs,drainTimeMs,memoryMB\n";
  const rows = results.map((r) => [r.heapSize, r.enqueueTimeMs, r.dequeueTimeMs, r.drainTimeMs, r.memoryMB].join(",")).join("\n");

  fs.writeFileSync(path, header + rows);
  console.log(`CSV written to ${path}`);
}

function main() {
  const priorityResults: Result[] = [];
  const yoctoResults: Result[] = [];

  for (const size of sizes) {
    console.log(`Benchmarking PriorityQueue size=${size}`);
    priorityResults.push(benchmarkPriorityQueue(size));

    console.log(`Benchmarking YoctoQueue size=${size}`);
    yoctoResults.push(benchmarkYoctoQueue(size));
  }

  saveCSV(priorityResults, "benchmark/priority.csv");
  saveCSV(yoctoResults, "benchmark/yocto.csv");
}

main();
