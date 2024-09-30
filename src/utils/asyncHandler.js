/**
 * A higher-order function that wraps asynchronous route handlers.
 *
 * This function catches any errors thrown in the asynchronous handler and passes them to the next middleware,
 * ensuring that they are properly handled and do not crash the server.
 *
 * @param {Function} requestHandler - The asynchronous route handler function.
 * @returns {Function} - A middleware function that handles requests and catches errors.
 */
const asyncHandler = (requestHandler) => {
    if (typeof requestHandler !== 'function') {
        throw new TypeError('Expected requestHandler to be a function');
    }

    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch(next); // Passes any error to the next middleware
    };
};

export { asyncHandler };
