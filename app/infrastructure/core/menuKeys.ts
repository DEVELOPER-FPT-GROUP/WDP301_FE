import {
  IconHome2,
  IconCalendarWeek,
  IconHierarchy,
  IconLabelImportant,
  IconGrave2,
  IconReplaceUser,
  IconDashboard,
  IconMoneybag,
  IconUserCircle,
  IconReceiptDollar,
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
  {
    label: "Tài khoản",
    leftIcon: IconUserCircle,
    path: AppRoutes.PRIVATE.Profile,
  },
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
  {
    label: "Tài khoản",
    leftIcon: IconUserCircle,
    path: AppRoutes.PRIVATE.Profile,
  },
];

export const systemAdminMenuKeys: MenuItem[] = [
  {
    label: "Thống kê",
    leftIcon: IconDashboard,
    path: AppRoutes.PRIVATE.DASHBOARD,
  },
  {
    label: "Doanh thu",
    leftIcon: IconMoneybag,
    path: AppRoutes.PRIVATE.REVENUE,
  },
  {
    label: "Quản lý tài khoản",
    leftIcon: IconUserCircle,
    path: AppRoutes.PRIVATE.MANAGE_ACCOUNT,
  },
  {
    label: "Quản lý đơn hàng",
    leftIcon: IconReceiptDollar,
    path: AppRoutes.PRIVATE.MANAGE_ORDER,
  },
  // {
  //   label: "Tài khoản",
  //   leftIcon: IconUserCircle,
  //   path: AppRoutes.PRIVATE.Profile,
  // },
];
