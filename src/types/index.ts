import { Request, Response, NextFunction } from "express"

export interface IJwtAuthToken {
  access: string
  refresh?: string
  mfa?: string
  exp?: string | number
}
export enum JwtSignatures {
  ACCESS_TOKEN = "access",
  REFRESH_TOKEN = "refresh",
  USER_ROLE = "role",
}

export interface IJwtAccessToken {
  userId?: string
  username: string
  name?: string
  email: string
  expire?: string | number
  mfa?: {
    validated: boolean
    enabled: boolean
  }
}

export enum AccountStatus {
  ACTIVE = "active",
  BANNED = "banned",
  BLOCKED = "blocked",
  CANCELLED = "cancelled",
  CREATED = "created",
  PENDING = "pending",
}

export enum HTTPStatusCode {
  OK = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 204,
  ResetContent = 205,
  PartialContent = 206,
  MultiStatus = 207,
  AlreadyReported = 208,
  IMUsed = 226,

  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,

  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HTTPVersionNotSupported = 505,
}

export interface ICurrentSessionData {
  jwt: IJwtAuthToken
}

export interface IRequestError {
  message: string
  field?: string
}

export type IAsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>

export enum UserRole {
  SELLER = "user:seller",
  PRIVATE_DEALER = "user:private-dealer",
  ADMIN = "internal:admin",
}
