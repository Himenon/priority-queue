#!/bin/bash

set -e

pnpm run ts ./benchmark/compare.ts

cd benchmark

gnuplot compare-time.gnuplot
gnuplot compare-memory.gnuplot

cd -
