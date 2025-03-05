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
    static readonly FAMILY_EVENT = "/event";
    static readonly FAMILY_HISTORY = "/history";
    static readonly FAMILY_DEATH_ANNIVESARY = "/death";
    static readonly MANAGE_FAMILY_HISTORY = "/manage-history";
    static readonly MANAGE_MEMBER = "/manage-member";
    static readonly DETAIl_MEMBER = "/detail-member";
  };
}
