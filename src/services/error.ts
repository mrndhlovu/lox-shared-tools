import { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import { ValidationError } from "express-validator"
import { IAsyncRequestHandler, HTTPStatusCode, IRequestError } from "../types"

export abstract class AbstractBaseError extends Error {
  constructor(message: string) {
    super(message)

    Object.setPrototypeOf(this, AbstractBaseError.prototype)
  }

  abstract isOperational: boolean
  abstract statusCode: HTTPStatusCode
  abstract serialiseError(): IRequestError[] | ValidationError[]
}

export class BaseError extends AbstractBaseError {
  constructor(
    public statusCode: HTTPStatusCode,
    public description: string,
    public isOperational: boolean = true
  ) {
    super(description)
    Object.setPrototypeOf(this, new.target.prototype)

    statusCode = this.statusCode
    isOperational = this.isOperational

    Error.captureStackTrace(this)
  }

  serialiseError() {
    return [{ message: this.description }]
  }
}

export class RequestValidationError extends BaseError {
  constructor(public errors: ValidationError[]) {
    super(HTTPStatusCode.BadRequest, "Invalid request parameters")
  }

  serialiseError() {
    return this.errors.map(error => ({
      message: error.msg,
      field: error.param,
    }))
  }
}

export class PermissionRequestError extends BaseError {
  constructor(message: string = "Permission denied") {
    super(HTTPStatusCode.Forbidden, message)
  }
}

export class DatabaseError extends BaseError {
  constructor(public message: string = "Invalid server configurations") {
    super(HTTPStatusCode.InternalServerError, message, false)
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string = "Route not found") {
    super(HTTPStatusCode.NotFound, message)
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(HTTPStatusCode.BadRequest, message)
  }
}

export class NotAuthorisedError extends BaseError {
  constructor(message: string) {
    super(HTTPStatusCode.Unauthorized, message)
  }
}

class ErrorService {
  public catchAsyncError(callback: IAsyncRequestHandler) {
    return async (req: Request, res: Response, next: NextFunction) => {
      return callback(req, res, next).catch(next)
    }
  }
  
  public errorHandler: ErrorRequestHandler = (
    error: BaseError | Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (error instanceof BaseError) {
      return res
        .status(error.statusCode)
        .send({ errors: error.serialiseError() })
    }

    res
      .status(HTTPStatusCode.BadRequest)
      .send({ errors: [{ message: error.message }] })
  }
}

const errorService = new ErrorService()

export { errorService }
