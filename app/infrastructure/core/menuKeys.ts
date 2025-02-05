import { IconHome2, IconUser, IconUserFilled } from "@tabler/icons-react";
import type { MenuItem } from "../common/components/layout/menuItems";
import { AppRoutes } from "./AppRoutes";

export const menuKeys: MenuItem[] = [
	{
		label: "Family Tree",
		leftIcon: IconHome2,
		path: AppRoutes.PRIVATE.FAMILY_TREE,
	},
	//   {
	//     label: "Account",
	//     leftIcon: IconUser,
	//     path: AppRoutes.PRIVATE.ACCOUNT,
	//     children: [
	//       {
	//         label: "Profile",
	//         leftIcon: IconUserFilled,
	//         path: AppRoutes.PRIVATE.Profile,
	//       },
	//     ],
	//   },
];
