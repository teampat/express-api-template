-- WRK Lua script for mixed workload testing
-- This script randomly chooses between different API endpoints

wrk.headers["Content-Type"] = "application/json"

-- Define different request types
local requests = {
    {
        method = "GET",
        path = "/health",
        body = "",
        weight = 40  -- 40% of requests
    },
    {
        method = "POST",
        path = "/api/v1/auth/register",
        body_template = '{"email":"user%d@example.com","password":"password123","name":"User %d"}',
        weight = 30  -- 30% of requests
    },
    {
        method = "POST",
        path = "/api/v1/auth/login",
        body = '{"email":"test@example.com","password":"password123"}',
        weight = 20  -- 20% of requests
    },
    {
        method = "GET",
        path = "/api/v1/users",
        body = "",
        weight = 10  -- 10% of requests
    }
}

-- Build weighted request array
local weighted_requests = {}
for _, req in ipairs(requests) do
    for i = 1, req.weight do
        table.insert(weighted_requests, req)
    end
end

local counter = 0

function request()
    counter = counter + 1
    
    -- Select random request type
    local req = weighted_requests[math.random(#weighted_requests)]
    
    wrk.method = req.method
    wrk.path = req.path
    
    local body = req.body or ""
    if req.body_template then
        body = string.format(req.body_template, counter, counter)
    end
    
    return wrk.format(wrk.method, wrk.path, wrk.headers, body)
end

-- Track metrics per endpoint
local endpoint_stats = {}

function response(status, headers, body)
    local endpoint = wrk.path
    if not endpoint_stats[endpoint] then
        endpoint_stats[endpoint] = {
            total = 0,
            success = 0,
            errors = 0,
            status_codes = {}
        }
    end
    
    local stats = endpoint_stats[endpoint]
    stats.total = stats.total + 1
    stats.status_codes[status] = (stats.status_codes[status] or 0) + 1
    
    if status >= 200 and status < 300 then
        stats.success = stats.success + 1
    else
        stats.errors = stats.errors + 1
    end
end

function done(summary, latency, requests)
    print("=== Mixed Workload Results ===")
    
    for endpoint, stats in pairs(endpoint_stats) do
        print(string.format("\n%s:", endpoint))
        print(string.format("  Total requests: %d", stats.total))
        print(string.format("  Success rate: %.2f%%", (stats.success / stats.total) * 100))
        print(string.format("  Error rate: %.2f%%", (stats.errors / stats.total) * 100))
        
        print("  Status codes:")
        for status, count in pairs(stats.status_codes) do
            print(string.format("    %d: %d", status, count))
        end
    end
end
