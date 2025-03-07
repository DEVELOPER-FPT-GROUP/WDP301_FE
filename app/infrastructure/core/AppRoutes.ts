export class AppRoutes {
	static readonly ROOT = "/";
	static readonly PUBLIC = class {
		static readonly GUEST = {
			HOME: "/home",
		};
		static readonly AUTH = {
			LOGIN: "/login",
			SIGN_UP: "/sign-up",
		};
	};
	static readonly PRIVATE = class {
		static readonly FAMILY_TREE = "/family-tree";
		static readonly ACCOUNT = "/account";
		static readonly Profile = "/profile";
	};
}
