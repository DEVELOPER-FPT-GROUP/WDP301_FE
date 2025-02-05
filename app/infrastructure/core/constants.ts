export class Constants {
	static readonly APP_NAME = "Genealogy_App";
	static readonly API_ACCESS_TOKEN_KEY = "ACCESS_TOKEN_HERE";
	static readonly API_REFRESH_TOKEN_KEY = "REFRESH_TOKEN_HERE";
	static readonly API_ROLE = "PUT_YOUR_API_ROLE_HERE";

	static readonly ROLES = class {
		static readonly ADMIN = {
			name: "Family-Leader",
			value: "family-leader",
		};
		static readonly USER = {
			name: "Family-Member",
			value: "family-member",
		};
	};
}
