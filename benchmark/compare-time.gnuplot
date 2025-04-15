set datafile separator ","
set terminal pngcairo size 1200,600 enhanced font 'Arial,10'
set output 'compare-time.png'

set title "Queue Time Comparison"
set xlabel "Heap Size"
set ylabel "Time (ms)"
set key outside
set grid

plot \
  'priority.csv' using 1:2 with linespoints title "Enqueue - Priority", \
  'yocto.csv' using 1:2 with linespoints title "Enqueue - Yocto", \
  'priority.csv' using 1:3 with linespoints title "Dequeue - Priority", \
  'yocto.csv' using 1:3 with linespoints title "Dequeue - Yocto", \
  'priority.csv' using 1:4 with linespoints title "Drain - Priority", \
  'yocto.csv' using 1:4 with linespoints title "Drain - Yocto"
