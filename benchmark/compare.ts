import * as fs from "node:fs";
import { performance } from "node:perf_hooks";
import YoctoQueue from "yocto-queue";
import { PriorityQueue } from "../src";

declare let global: {
  gc?: () => void;
};

const sizes = [1000, 5000, 10000, 25000, 50000, 100000];
const trials = 10;

type Measurement = number;
type ResultSet = Measurement[];

type Stats = {
  mean: number;
  stddev: number;
  min: number;
  max: number;
  median: number;
  p25: number;
  p75: number;
};

type AggregatedResult = {
  heapSize: number;
  queueType: "priority" | "yocto";
  operation: "enqueue" | "dequeue" | "drain" | "memory";
  stats: Stats;
};

function memoryInMB(): number {
  if (global.gc) global.gc();
  return Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
}

function measureTime<T>(fn: () => T): { time: number; result: T } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { time: end - start, result };
}

function stats(values: number[]): Stats {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, v) => sum + v, 0) / sorted.length;
  const variance = sorted.reduce((sum, v) => sum + (v - mean) ** 2, 0) / sorted.length;
  const stddev = Math.sqrt(variance);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p25 = sorted[Math.floor(sorted.length * 0.25)];
  const p75 = sorted[Math.floor(sorted.length * 0.75)];
  return {
    mean,
    stddev,
    median,
    p25,
    p75,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

async function benchmarkPriorityQueue(size: number): Promise<AggregatedResult[]> {
  const enqueueTimes: ResultSet = [];
  const dequeueTimes: ResultSet = [];
  const drainTimes: ResultSet = [];
  const memories: ResultSet = [];

  for (let i = 0; i < trials; i++) {
    const pq = new PriorityQueue<number>(true);
    const data = Array.from({ length: size }, (_, i) => ({
      value: i,
      priority: Math.floor(Math.random() * size),
    }));

    const { time: enqueueTime } = measureTime(() => {
      for (const item of data) {
        pq.enqueue(item.value, item.priority);
      }
    });
    enqueueTimes.push(enqueueTime);

    const { time: dequeueTime } = measureTime(() => {
      while (!pq.isEmpty()) pq.dequeue();
    });
    dequeueTimes.push(dequeueTime);

    for (const item of data) {
      pq.enqueue(item.value, item.priority);
    }

    const { time: drainTime } = measureTime(() => {
      [...pq.drain()];
    });
    drainTimes.push(drainTime);

    memories.push(memoryInMB());
  }

  return [
    { heapSize: size, queueType: "priority", operation: "enqueue", stats: stats(enqueueTimes) },
    { heapSize: size, queueType: "priority", operation: "dequeue", stats: stats(dequeueTimes) },
    { heapSize: size, queueType: "priority", operation: "drain", stats: stats(drainTimes) },
    { heapSize: size, queueType: "priority", operation: "memory", stats: stats(memories) },
  ];
}

async function benchmarkYoctoQueue(size: number): Promise<AggregatedResult[]> {
  const enqueueTimes: ResultSet = [];
  const dequeueTimes: ResultSet = [];
  const drainTimes: ResultSet = [];
  const memories: ResultSet = [];

  for (let i = 0; i < trials; i++) {
    const q = new YoctoQueue<number>();
    const data = Array.from({ length: size }, (_, i) => i);

    const { time: enqueueTime } = measureTime(() => {
      for (const item of data) q.enqueue(item);
    });
    enqueueTimes.push(enqueueTime);

    const { time: dequeueTime } = measureTime(() => {
      while (q.size > 0) q.dequeue();
    });
    dequeueTimes.push(dequeueTime);

    for (const item of data) q.enqueue(item);

    const { time: drainTime } = measureTime(() => {
      [...q.drain()];
    });
    drainTimes.push(drainTime);

    memories.push(memoryInMB());
  }

  return [
    { heapSize: size, queueType: "yocto", operation: "enqueue", stats: stats(enqueueTimes) },
    { heapSize: size, queueType: "yocto", operation: "dequeue", stats: stats(dequeueTimes) },
    { heapSize: size, queueType: "yocto", operation: "drain", stats: stats(drainTimes) },
    { heapSize: size, queueType: "yocto", operation: "memory", stats: stats(memories) },
  ];
}

function saveCSV(results: AggregatedResult[], path: string) {
  const header = `${["heapSize", "queueType", "operation", "mean", "stddev", "median", "p25", "p75", "min", "max"].join(",")}\n`;

  const rows = results
    .map((r) =>
      [
        r.heapSize,
        r.queueType,
        r.operation,
        r.stats.mean.toFixed(3),
        r.stats.stddev.toFixed(3),
        r.stats.median.toFixed(3),
        r.stats.p25.toFixed(3),
        r.stats.p75.toFixed(3),
        r.stats.min.toFixed(3),
        r.stats.max.toFixed(3),
      ].join(","),
    )
    .join("\n");

  fs.writeFileSync(path, header + rows);
  console.log(`📄 CSV written: ${path}`);
}

async function main() {
  const allResults: AggregatedResult[] = [];

  for (const size of sizes) {
    console.log(`📦 Benchmarking PriorityQueue @${size}`);
    allResults.push(...(await benchmarkPriorityQueue(size)));

    console.log(`📦 Benchmarking YoctoQueue @${size}`);
    allResults.push(...(await benchmarkYoctoQueue(size)));
  }

  saveCSV(allResults, "benchmark/stats.csv");
}

main();
