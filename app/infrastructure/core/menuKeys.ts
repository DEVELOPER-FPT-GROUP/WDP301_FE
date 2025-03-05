import {
  IconHome2,
  IconCalendarWeek,
  IconHierarchy,
  IconLabel,
  IconLabelImportant,
  IconUser,
  IconUserFilled,
  IconGrave2,
  IconReplaceUser,
} from "@tabler/icons-react";
import type { MenuItem } from "../common/components/layout/menuItems";
import { AppRoutes } from "./AppRoutes";

export const userMenuKeys: MenuItem[] = [
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
  // {
  // 	label: "Quản lý lịch sử",
  // 	leftIcon: IconHierarchy,
  // 	path: AppRoutes.PRIVATE.MANAGE_FAMILY_HISTORY,
  // },
  // {
  // 	label: "Quản lý ngày giỗ",
  // 	leftIcon: IconGrave2,
  // 	path: AppRoutes.PRIVATE.MANAGE_FAMILY_DEATH,
  // },
];
export const adminMenuKeys: MenuItem[] = [
  {
    label: "Cây gia phả",
    leftIcon: IconHome2,
    path: AppRoutes.PRIVATE.FAMILY_TREE,
  },
  {
    label: "Quản lý thành viên",
    leftIcon: IconReplaceUser,
    path: AppRoutes.PRIVATE.MANAGE_MEMBER,
  },
  // {
  // 	label: "Sự kiện",
  // 	leftIcon: IconCalendarWeek,
  // 	path: AppRoutes.PRIVATE.FAMILY_EVENT,
  // },
  // {
  // 	label: "Lịch sử dòng họ",
  // 	leftIcon: IconHierarchy,
  // 	path: AppRoutes.PRIVATE.FAMILY_HISTORY,
  // },
  // {
  // 	label: "Ngày giỗ",
  // 	leftIcon: IconLabelImportant,
  // 	path: AppRoutes.PRIVATE.FAMILY_DEATH_ANNIVESARY,
  // },
  {
    label: "Quản lý lịch sử",
    leftIcon: IconHierarchy,
    path: AppRoutes.PRIVATE.MANAGE_FAMILY_HISTORY,
  },
  {
    label: "Quản lý ngày giỗ",
    leftIcon: IconGrave2,
    path: AppRoutes.PRIVATE.MANAGE_FAMILY_DEATH,
  },
];
