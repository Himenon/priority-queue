set datafile separator ","
set terminal pngcairo size 1200,600 enhanced font 'Arial,10'
set output 'compare.png'

set title "Queue Performance Comparison"
set xlabel "Heap Size"
set ylabel "Time (ms)"
set key outside
set grid

plot \
  'compare.csv' using 2:3 every ::1::2 with linespoints title "Enqueue - Priority", \
  '' using 2:3 every ::2::2 with linespoints title "Enqueue - Yocto", \
  '' using 2:4 every ::1::2 with linespoints title "Dequeue - Priority", \
  '' using 2:4 every ::2::2 with linespoints title "Dequeue - Yocto", \
  '' using 2:5 every ::1::2 with linespoints title "Drain - Priority", \
  '' using 2:5 every ::2::2 with linespoints title "Drain - Yocto"
