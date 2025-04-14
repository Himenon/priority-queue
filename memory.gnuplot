set datafile separator ","
set terminal pngcairo size 1000,600 enhanced font 'Arial,10'
set output 'memory.png'

set title "Priority Queue Memory Usage"
set xlabel "Heap Size"
set ylabel "Memory (MB)"
set key outside
set grid

plot 'benchmark.csv' using 1:6 with linespoints title "Memory Used"
