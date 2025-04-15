set output 'compare-memory.png'
set title "Queue Memory Usage Comparison"
set xlabel "Heap Size"
set ylabel "Memory Usage (MB)"

set datafile separator ","
set terminal pngcairo size 800,600 enhanced font 'Arial,10'
set key outside top right
set grid

plot \
  'priority.csv' using 1:5 with linespoints title "PriorityQueue", \
  'yocto.csv' using 1:5 with linespoints title "YoctoQueue"
