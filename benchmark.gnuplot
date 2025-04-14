set datafile separator ","
set terminal pngcairo size 1000,600 enhanced font 'Arial,10'
set output 'benchmark.png'

set title "Priority Queue Benchmark"
set xlabel "Heap Size"
set ylabel "Time (ms)"
set key outside right top
set grid

plot \
  'benchmark.csv' using 1:2 with linespoints title "Enqueue", \
  '' using 1:3 with linespoints title "Dequeue", \
  '' using 1:4 with linespoints title "Reheapify", \
  '' using 1:5 with linespoints title "Drain"
