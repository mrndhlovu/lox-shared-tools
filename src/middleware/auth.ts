import { Response, NextFunction, Request } from "express"
import { validationResult } from "express-validator"
import jwt from "jsonwebtoken"
import { errorService } from "../services/error"
import { ICurrentSessionData, ICurrentUserAccessJWT } from "../types"
import { RequestValidationError, NotAuthorisedError } from "../services/error"
import { NOT_AUTHORISED } from "../helpers/constants"

declare global {
  namespace Express {
    interface Request {
      currentUserJwt: ICurrentUserAccessJWT
      session?: ICurrentSessionData
    }
  }
}

class AuthMiddleWare {
  checkIsAuthenticated = errorService.catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.session) {
        throw new NotAuthorisedError(NOT_AUTHORISED)
      }

      if (!req.session || !req.session.jwt?.access) {
        throw new NotAuthorisedError(NOT_AUTHORISED)
      }

      const currentUserJwt = jwt.verify(
        req.session.jwt?.access,
        process.env.JWT_TOKEN_SIGNATURE!
      )

      if (!currentUserJwt) {
        throw new NotAuthorisedError("token failed validation")
      }

      req.currentUserJwt = currentUserJwt as ICurrentUserAccessJWT
      next()

      return this
    }
  )

  validateRequestBodyFields = errorService.catchAsyncError(
    async (req: Request, _res: Response, next: NextFunction) => {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array())
      }

      next()
      return this
    }
  )

  validateRequiredAccessToken = errorService.catchAsyncError(
    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req.session || !req.session.jwt) {
        throw new NotAuthorisedError(NOT_AUTHORISED)
      }

      next()
      return this
    }
  )

  validateRequiredRefreshToken = errorService.catchAsyncError(
    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req?.session || !req?.session?.jwt?.refresh) {
        throw new NotAuthorisedError(NOT_AUTHORISED)
      }

      const currentUserJwt = jwt.verify(
        req.session.jwt.refresh,
        process.env.JWT_REFRESH_TOKEN_SIGNATURE!
      )

      if (!currentUserJwt) {
        throw new NotAuthorisedError("token failed validation")
      }

      req.currentUserJwt = currentUserJwt as ICurrentUserAccessJWT

      next()
    }
  )
}

export const authMiddleware = new AuthMiddleWare()
