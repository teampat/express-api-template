-- WRK Lua script for latency testing
-- This script focuses on measuring latency with minimal load

wrk.method = "GET"

-- Simple health check request
function request()
    return wrk.format("GET", "/health", nil, "")
end

-- Track detailed latency metrics
local latencies = {}
local start_times = {}

function init(args)
    latencies = {}
end

function request()
    start_times[math.random()] = os.clock() * 1000  -- milliseconds
    return wrk.format("GET", "/health", nil, "")
end

function response(status, headers, body)
    -- Record latency if we can match the request
    -- Note: wrk doesn't provide direct request/response correlation
    -- so this is a simplified approach
end

function done(summary, latency, requests)
    print("=== Latency-Focused Test Results ===")
    print(string.format("Requests completed: %d", summary.requests))
    print(string.format("Average latency: %.2fms", latency.mean / 1000))
    print(string.format("Latency std dev: %.2fms", latency.stdev / 1000))
    print(string.format("Min latency: %.2fms", latency.min / 1000))
    print(string.format("Max latency: %.2fms", latency.max / 1000))
    
    print("\nLatency Percentiles:")
    print(string.format("  50th percentile: %.2fms", latency:percentile(50) / 1000))
    print(string.format("  90th percentile: %.2fms", latency:percentile(90) / 1000))
    print(string.format("  95th percentile: %.2fms", latency:percentile(95) / 1000))
    print(string.format("  99th percentile: %.2fms", latency:percentile(99) / 1000))
    print(string.format("  99.9th percentile: %.2fms", latency:percentile(99.9) / 1000))
end
