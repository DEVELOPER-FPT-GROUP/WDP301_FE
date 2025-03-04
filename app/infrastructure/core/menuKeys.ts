import { IconHome2, IconCalendarWeek, IconHierarchy, IconLabel, IconLabelImportant, IconUser, IconUserFilled } from "@tabler/icons-react";
import type { MenuItem } from "../common/components/layout/menuItems";
import { AppRoutes } from "./AppRoutes";

export const menuKeys: MenuItem[] = [
	{
		label: "Cây gia phả",
		leftIcon: IconHome2,
		path: AppRoutes.PRIVATE.FAMILY_TREE,
	},
	{
		label: "Sự kiện",
		leftIcon: IconCalendarWeek,
		path: AppRoutes.PRIVATE.FAMILY_EVENT,
	},
	{
		label: "Lịch sử dòng họ",
		leftIcon: IconHierarchy,
		path: AppRoutes.PRIVATE.FAMILY_HISTORY,
	},
	{
		label: "Ngày giỗ",
		leftIcon: IconLabelImportant,
		path: AppRoutes.PRIVATE.FAMILY_DEATH_ANNIVESARY,
	},
	{
		label: "Quản lý lịch sử",
		leftIcon: IconHierarchy,
		path: AppRoutes.PRIVATE.MANAGE_FAMILY_HISTORY,
	},
	// {
	// 	label: "Test",
	// 	leftIcon: IconLabelImportant,
	// 	path: '/test',
	// },
	// {
	// 	label: "Account",
	// 	leftIcon: IconUser,
	// 	path: AppRoutes.PRIVATE.ACCOUNT,
	// 	children: [
	// 		{
	// 			label: "Profile",
	// 			leftIcon: IconUserFilled,
	// 			path: AppRoutes.PRIVATE.Profile,
	// 		},
	// 	],
	// },
];
