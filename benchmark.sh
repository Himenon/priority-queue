#!/bin/bash

set -e

pnpm run ts:benchmark ./benchmark/compare.ts

docker build -t plot-benchmark ./benchmark

docker run --rm -v "$PWD/benchmark":/app plot-benchmark

