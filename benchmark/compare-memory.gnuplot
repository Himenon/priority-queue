set datafile separator ","
set terminal pngcairo size 1000,600 enhanced font 'Arial,10'
set output 'compare-memory.png'

set title "Memory Usage Comparison"
set xlabel "Heap Size"
set ylabel "Memory (MB)"
set key outside
set grid

plot \
  'priority.csv' using 1:5 with linespoints title "PriorityQueue", \
  'yocto.csv' using 1:5 with linespoints title "YoctoQueue"
