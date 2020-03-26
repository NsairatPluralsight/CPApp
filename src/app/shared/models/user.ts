import { Permission } from "./permission";

export class loginUserData {
  username: string;
  password: string;
  applicationName: string;
}

export class AuthenticatedUser {
  username: string;
  userId: number;
  token: string;
  permission: Permission;
  isSSO: boolean;
  refreshTokenData: RefreshTokenData;
}

export class RefreshTokenData {
  refreshToken: string = undefined;
  token: string = undefined;

  constructor(refreshToken: string, accessToken: string) {
      this.refreshToken = refreshToken;
      this.token = accessToken;
  }
}
