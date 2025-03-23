import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Button,
  FileButton,
  Flex,
  Group,
  Paper,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBrandMantine,
  IconLogout,
  IconSearch,
  IconUpload,
} from "@tabler/icons-react";
import { jwtDecode } from "jwt-decode";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import MenuItemsRenderer from "~/infrastructure/common/components/layout/menuItems";
import { Constants } from "~/infrastructure/core/constants";
import {
  adminMenuKeys,
  systemAdminMenuKeys,
  userMenuKeys,
} from "~/infrastructure/core/menuKeys";
import { useLogout } from "~/infrastructure/utils/auth/auth";
import HeaderSearch from "../component/HeaderSearch";

interface AppLayoutProps {
  children: ReactNode;
}

const getRoleFromToken = () => {
  const token = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return null;
  }
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const makeLogout = useLogout();
  const logout = useLogout();
  const role = getRoleFromToken();

  return (
    <AppShell
      header={{ height: 120 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" align="center">
          {/* Trái: Burger + Logo */}
          <Group>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
            />
            <IconBrandMantine size={30} />
          </Group>

          {/* Giữa: Search + Upload + Filter + Kết quả */}
          <HeaderSearch />

          {/* Phải: Logout icon */}
          <Group>
            <ActionIcon
              variant="subtle"
              radius="xl"
              size="xl"
              onClick={makeLogout}
            >
              <IconLogout stroke={1.5} onClick={logout} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <MenuItemsRenderer
          items={
            role === "system_admin"
              ? systemAdminMenuKeys
              : role === "family_leader"
              ? adminMenuKeys
              : userMenuKeys
          }
          userRoles={[]}
        />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default AppLayout;
