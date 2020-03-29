import { Permission } from './permission';
import { RefreshTokenData } from './refresh-token-data';

export class AuthenticatedUser {
    public username: string;
    public userId: number;
    public token: string;
    public permission: Permission;
    public isSSO: boolean;
    public refreshTokenData: RefreshTokenData;
}
