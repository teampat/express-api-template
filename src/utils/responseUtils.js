/**
 * Response Utility Functions
 * Standardized API response helpers
 */

/**
 * Standard success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Express response
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Standard error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Additional error details
 * @returns {Object} Express response
 */
const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors
    });
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors array
 * @param {string} message - Error message
 * @returns {Object} Express response
 */
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
    return res.status(400).json({
        success: false,
        message,
        errors: Array.isArray(errors) ? errors : [errors]
    });
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 * @returns {Object} Express response
 */
const notFoundResponse = (res, resource = 'Resource') => {
    return res.status(404).json({
        success: false,
        message: `${resource} not found`
    });
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Express response
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
    return res.status(401).json({
        success: false,
        message
    });
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Express response
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
    return res.status(403).json({
        success: false,
        message
    });
};

/**
 * Too many requests response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Express response
 */
const tooManyRequestsResponse = (res, message = 'Too many requests') => {
    return res.status(429).json({
        success: false,
        message
    });
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 * @returns {Object} Express response
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || 10,
            total: pagination.total || 0,
            totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
            hasNext: pagination.page < Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
            hasPrev: pagination.page > 1
        }
    });
};

/**
 * Created response
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 * @returns {Object} Express response
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
    return successResponse(res, data, message, 201);
};

/**
 * No content response
 * @param {Object} res - Express response object
 * @returns {Object} Express response
 */
const noContentResponse = (res) => {
    return res.status(204).send();
};

/**
 * Conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Express response
 */
const conflictResponse = (res, message = 'Resource already exists') => {
    return res.status(409).json({
        success: false,
        message
    });
};

/**
 * Bad request response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {*} errors - Additional error details
 * @returns {Object} Express response
 */
const badRequestResponse = (res, message = 'Bad request', errors = null) => {
    return errorResponse(res, message, 400, errors);
};

/**
 * Service unavailable response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Express response
 */
const serviceUnavailableResponse = (res, message = 'Service temporarily unavailable') => {
    return res.status(503).json({
        success: false,
        message
    });
};

module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse,
    notFoundResponse,
    unauthorizedResponse,
    forbiddenResponse,
    tooManyRequestsResponse,
    paginatedResponse,
    createdResponse,
    noContentResponse,
    conflictResponse,
    badRequestResponse,
    serviceUnavailableResponse
};
