#!/bin/bash

# 📊 Analyze existing benchmark results and generate markdown summary
./benchmark_scripts/unified-benchmark.sh analyze
./benchmark_scripts/generate-summary.sh
