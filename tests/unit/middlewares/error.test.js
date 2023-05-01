
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const httpMocks = require('node-mocks-http');
const { errorConverter, errorHandler } = require('../../../src/middlewares/error');
const ApiError = require('../../../src/utils/ApiError');
const config = require('../../../src/config/config');
const logger = require('../../../src/config/logger');


describe('Error middlewares', () => {
    describe('Error converter', () => {
        test('should return the same APIError object it was called with', () => {
            const error = new ApiError(httpStatus.BAD_REQUEST, 'Any error');
            const next = jest.fn();

            errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);
            expect(next).toHaveBeenCalledWith(error);
        });

        test('should convert an Error to ApiError and preserve its status and message', () => {
            const error = new Error('Any error');
            error.statusCode = httpStatus.BAD_REQUEST;
            const next = jest.fn();

            errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: error.statusCode,
                    message: error.message,
                    isOperational: false,
                })
            );
        });

        test('should convert an Error without status to ApiError with status 500', () => {
            const error = new Error('Any error');
            const next = jest.fn();

            errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                    isOperational: false,
                })
            );
        });

        test('should convert an Error without message to ApiError with default message of that http status', () => {
            const error = new Error();
            error.statusCode = httpStatus.BAD_REQUEST;
            const next = jest.fn();

            errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: error.statusCode,
                    message: httpStatus[error.statusCode],
                    isOperational: false,
                })
            );
        });

        test('should convert a Mongoose error to ApiError with status 400 and preserve its message', () => {
            const error = new mongoose.Error('Any mongoose error');
            const next = jest.fn();

            errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: httpStatus.BAD_REQUEST,
                    message: error.message,
                    isOperational: false,
                })
            );
        });

        test('should convert any other object to ApiError with status 500 and its message', () => {
            const error = {};
            const next = jest.fn();

            errorConverter(error, httpMocks.createRequest(), httpMocks.createResponse(), next);

            expect(next).toHaveBeenCalledWith(expect.any(ApiError));
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                    message: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
                    isOperational: false,
                })
            );
        });
    });
});