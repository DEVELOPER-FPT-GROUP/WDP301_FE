export class LoginResponse {
	id: number;
	username: string;
	email: string;
	accessToken: string;
	refreshToken: string;

	constructor(
		id: number,
		username: string,
		email: string,
		accessToken: string,
		refreshToken: string,
	) {
		this.id = id;
		this.username = username;
		this.email = email;
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}
}
