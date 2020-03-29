export enum Result {
  Success = 0,
  Failed = -1,
}

export enum Direction {
  None = 0,
  Right = 1,
  Left = 2,
}

export enum CountersOption {
  All = 0,
  Custom  = 1,
}

export enum InternalStatus {
  Preparing = 0,
  Ready = 1,
  Error = 2,
  Connecting = 3,
}

export enum ErrorType {
  General = 0,
  Connection = 1,
  Database = 2,
}

export enum MainLCDDisplayMode {
  CurrentCustomer = 0,
  WithWaiting = 1,
}

export enum AuthenticationMode {
  Seamless = 0,
  UsernameAndPassword = 1,
}

export enum LoginErrorCodes {
  Success = 0,
  Error = -1,
  InvalidUsername = -900,
  InvalidLoginData = -901,
  UnauthorizedLogin = -902,
  PasswordExpired = -903,
  UserInactive = -904,
  UserLocked = -905,
  InvalidPassword = -906,
  InvalidUserForLogout = -907,
  RefreshTokenNotPresent = -908,
  InvalidToken = -909,
  InvalidRefreshToken = -910,
  SSONotEnabled = -911,
}

export enum Error {
  General = -1,
  NotAllowed = -2,
  Unauthorized = -3,
  Disconnected = -4,
}

export enum PermissionType {
    Create = 0,
    Edit = 1,
    Read = 2,
    Delete = 3,
    Report = 15,
}

export enum ServiceStatus {
  Unknown = 'unknown',
  Working = 'working',
  Error = 'error',
}
