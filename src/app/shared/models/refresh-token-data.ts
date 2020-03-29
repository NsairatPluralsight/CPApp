export class RefreshTokenData {
    public refreshToken: string = undefined;
    public token: string = undefined;

    constructor(refreshToken: string, accessToken: string) {
        this.refreshToken = refreshToken;
        this.token = accessToken;
    }
}
