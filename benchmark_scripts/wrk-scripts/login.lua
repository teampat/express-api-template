-- WRK Lua script for testing login endpoint
-- This script attempts to login with various users

wrk.method = "POST"
wrk.headers["Content-Type"] = "application/json"

-- Pre-registered test users (you should register these first)
local users = {
    '{"email":"test1@example.com","password":"password123"}',
    '{"email":"test2@example.com","password":"password123"}',
    '{"email":"test3@example.com","password":"password123"}',
    '{"email":"test4@example.com","password":"password123"}',
    '{"email":"test5@example.com","password":"password123"}'
}

local counter = 0

function request()
    counter = counter + 1
    local user_index = (counter % #users) + 1
    return wrk.format(wrk.method, wrk.path, wrk.headers, users[user_index])
end

-- Track login success/failure
local responses = {}
local successful_logins = 0
local failed_logins = 0

function response(status, headers, body)
    responses[status] = (responses[status] or 0) + 1
    
    if status == 200 then
        successful_logins = successful_logins + 1
    else
        failed_logins = failed_logins + 1
    end
end

function done(summary, latency, requests)
    print("=== Login Test Results ===")
    for status, count in pairs(responses) do
        print(string.format("  %d: %d (%.2f%%)", status, count, (count / summary.requests) * 100))
    end
    
    print(string.format("\nSuccessful logins: %d (%.2f%%)", successful_logins, (successful_logins / summary.requests) * 100))
    print(string.format("Failed logins: %d (%.2f%%)", failed_logins, (failed_logins / summary.requests) * 100))
end
