import * as fs from "node:fs";
import { performance } from "node:perf_hooks";
import { PriorityQueue } from "./src/index.js";

type BenchmarkResult = {
  heapSize: number;
  enqueueTimeMs: number;
  dequeueTimeMs: number;
  reheapifyTimeMs: number;
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

function runBenchmark(heapSize: number): BenchmarkResult {
  const pq = new PriorityQueue<number>(true);
  const data = Array.from({ length: heapSize }, (_, i) => ({
    value: i,
    priority: Math.floor(Math.random() * heapSize),
  }));

  const { durationMs: enqueueTimeMs } = measureTime(() => {
    for (const item of data) {
      pq.enqueue(item.value, item.priority);
    }
  });

  const { durationMs: reheapifyTimeMs } = measureTime(() => {
    pq.setMaxHeap(); // triggers reheapify
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
    heapSize,
    enqueueTimeMs,
    dequeueTimeMs,
    reheapifyTimeMs,
    drainTimeMs,
    memoryMB,
  };
}

function saveCSV(results: BenchmarkResult[], path = "benchmark.csv") {
  const header = "heapSize,enqueueTimeMs,dequeueTimeMs,reheapifyTimeMs,drainTimeMs,memoryMB\n";
  const rows = results
    .map((r) => [r.heapSize, r.enqueueTimeMs, r.dequeueTimeMs, r.reheapifyTimeMs, r.drainTimeMs, r.memoryMB].join(","))
    .join("\n");

  fs.writeFileSync(path, header + rows);
  console.log(`CSV saved to ${path}`);
}

function main() {
  const heapSizes = [1000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000];
  const results: BenchmarkResult[] = [];

  for (const size of heapSizes) {
    console.log(`Running benchmark for heap size = ${size}`);
    const result = runBenchmark(size);
    results.push(result);
  }

  saveCSV(results);
}

main();
