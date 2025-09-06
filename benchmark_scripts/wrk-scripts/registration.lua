-- WRK Lua script for testing user registration endpoint
-- This script generates unique email addresses for each request

wrk.method = "POST"
wrk.headers["Content-Type"] = "application/json"

-- Counter for unique emails
local counter = 0
local thread_id = 0

function setup(thread)
    thread_id = thread.id
    thread:set("id", thread.id)
end

function init(args)
    counter = 0
end

function request()
    counter = counter + 1
    local email = string.format("loadtest%d_%d_%d@example.com", thread_id, counter, os.time())
    local body = string.format('{"email":"%s","password":"password123","name":"Load Test User %d"}', email, counter)
    
    return wrk.format(wrk.method, wrk.path, wrk.headers, body)
end

-- Track response statistics
local responses = {}
local latencies = {}

function response(status, headers, body)
    responses[status] = (responses[status] or 0) + 1
    
    -- Parse response for additional metrics
    if status == 201 then
        -- Successful registration
    elseif status == 409 then
        -- Duplicate email (shouldn't happen with our unique generation)
    elseif status == 429 then
        -- Rate limited
    end
end

function done(summary, latency, requests)
    print("=== Response Status Codes ===")
    for status, count in pairs(responses) do
        print(string.format("  %d: %d (%.2f%%)", status, count, (count / summary.requests) * 100))
    end
    
    print("\n=== Additional Metrics ===")
    print(string.format("  Total errors: %d", summary.errors.connect + summary.errors.read + summary.errors.write + summary.errors.status + summary.errors.timeout))
    print(string.format("  Success rate: %.2f%%", (responses[201] or 0) / summary.requests * 100))
end
