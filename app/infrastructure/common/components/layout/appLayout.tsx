import { ActionIcon, AppShell, Box, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBrandMantine, IconLogout } from "@tabler/icons-react";
import type { ReactNode } from "react";
import MenuItemsRenderer from "~/infrastructure/common/components/layout/menuItems";
import { menuKeys } from "~/infrastructure/core/menuKeys";
import { useLogout } from "~/infrastructure/utils/auth/auth";
interface AppLayoutProps {
  children: ReactNode;
}
const AppLayout = ({ children }: AppLayoutProps) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const makeLogout = useLogout();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" className={"justify-between items-center"}>
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
          <Box>
            <ActionIcon
              variant="subtle"
              radius="xl"
              size={"xl"}
              onClick={makeLogout}
            >
              <IconLogout stroke={1.5} />
            </ActionIcon>
          </Box>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <MenuItemsRenderer items={menuKeys} userRoles={[]} />
      </AppShell.Navbar>
      <AppShell.Main
        style={{
          height: "calc(100vh - 60px)",
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
};

export default AppLayout;
