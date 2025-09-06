# 🔥 Benchmark Suite 2.0 - Simplified Edition

Complete Node.js vs Bun performance benchmarking toolkit, now unified in a single script with clean CLI interface.

## 🚀 Quick Start

```bash
# Quick 10-second test
./benchmark_scripts/quick.sh

# Complete benchmark suite  
./benchmark_scripts/unified-benchmark.sh

# AutoCannon tests only
./benchmark_scripts/unified-benchmark.sh autocannon

# wrk tests only
./benchmark_scripts/unified-benchmark.sh wrk

# Custom duration and connections
./benchmark_scripts/unified-benchmark.sh -d 60 -c 200

# Analyze existing results
./benchmark_scripts/analyze.sh
```

## 📋 Available Commands

| Command | Description | Duration |
|---------|-------------|----------|
| `quick.sh` | Fast development test | 10s |
| `unified-benchmark.sh` | Complete suite (default) | 30s |
| `unified-benchmark.sh simple` | Quick test | 10s |
| `unified-benchmark.sh autocannon` | AutoCannon only | 30s |
| `unified-benchmark.sh wrk` | wrk only | 30s |
| `analyze.sh` | Analyze results | - |

## 🎯 What's Included

### Single Unified Script (`unified-benchmark.sh`)
- **Environment Setup**: Automatic rate limiting bypass
- **AutoCannon Tests**: HTTP/1.1 load testing with detailed metrics
- **wrk Tests**: Simple, advanced, and comprehensive load testing  
- **Analysis**: Built-in result analysis and comparison
- **Cleanup**: Automatic environment restoration

### Quick Scripts
- `quick.sh` - 10-second development test
- `analyze.sh` - Analyze existing results

## 📊 Output

Results are organized in `benchmark-results/`:
```
benchmark-results/
├── autocannon/          # AutoCannon test results
├── wrk-simple/          # Basic wrk tests
├── wrk-advanced/        # Advanced wrk tests  
├── wrk-loadtest/        # Comprehensive wrk tests
├── simple/              # Quick test results
└── BENCHMARK_SUMMARY.md # 📄 Complete markdown summary
```

### 📄 **Markdown Summary Report**

After running any benchmark, a comprehensive markdown summary is automatically generated:
- **File:** `benchmark-results/BENCHMARK_SUMMARY.md`
- **Contains:** Performance comparisons, tables, recommendations
- **Format:** GitHub-compatible markdown with tables and emojis
- **Usage:** Perfect for documentation, reports, or sharing results

## 🔧 Configuration

Environment variables in `.env`:
```bash
BENCHMARK_MODE=false     # Auto-managed during tests
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📈 Typical Results

Based on recent benchmarks, Bun typically shows:
- **83% higher requests/sec** (6,141 vs 3,344 RPS)
- **46% lower latency** (15.78ms vs 29.40ms)
- **22% less memory usage** (194MB vs 248MB baseline)
- **65% higher throughput** (5.8 MB/s vs 3.51 MB/s)

## 🛠️ Dependencies

```bash
# Required for AutoCannon tests
npm install -g autocannon

# Required for wrk tests (macOS)
brew install wrk

# Required for analysis (recommended)
brew install jq
```

## 📁 Legacy Scripts

The following individual scripts are still available but deprecated:
- `benchmark.sh` - Original AutoCannon script
- `wrk-*.sh` - Individual wrk test scripts
- `analyze-*.js` - Separate analysis scripts

**Recommendation**: Use `unified-benchmark.sh` for all new benchmarking.

## 🧹 Cleanup

```bash
# Clean all results
./benchmark_scripts/unified-benchmark.sh clean

# Or manually
rm -rf benchmark-results/
```

## 🎮 Usage Examples

```bash
# Development workflow
./benchmark_scripts/quick.sh

# CI/CD benchmark
./benchmark_scripts/unified-benchmark.sh -d 15 -c 50

# Production comparison
./benchmark_scripts/unified-benchmark.sh -d 120 -c 500

# Analysis only (generates markdown summary)
./benchmark_scripts/analyze.sh

# Generate summary from existing results
./benchmark_scripts/generate-summary.sh
```

## 📄 **Viewing Results**

```bash
# View markdown summary
cat benchmark-results/BENCHMARK_SUMMARY.md

# Open in default markdown viewer
open benchmark-results/BENCHMARK_SUMMARY.md

# View specific test results
cat benchmark-results/autocannon/nodejs_health_load.json | jq
```
