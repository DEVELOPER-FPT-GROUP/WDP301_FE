import {
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  ScrollArea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MantineLogo } from "@mantinex/mantine-logo";
import { useNavigate } from "react-router";
import { AppRoutes } from "~/infrastructure/core/AppRoutes";
import { Link } from "react-scroll";
import "./Header.css";

const menuItems = [
  { label: "Trang chủ", id: "home" },
  { label: "Tính năng", id: "feature" },
  { label: "Phản hồi", id: "feedback" },
  { label: "Tin tức", id: "new" },
  { label: "Liên hệ", id: "contact" },
];

export default function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const navigate = useNavigate();

  return (
    <Box
      style={{
        position: "sticky",
        top: 0,
        width: "100%",
        backgroundColor: "white", // Đảm bảo không bị trong suốt khi scroll
        zIndex: 1000, // Giữ trên các phần tử khác
      }}
    >
      <header className="header">
        <Group justify="space-between" h="100%">
          <MantineLogo size={30} />
          <Group h="100%" gap={20} visibleFrom="sm">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.id}
                smooth={true}
                duration={1000}
                spy={true}
                className="cursor-pointer hover:text-orange-400 fw-bold"
                // activeClass="text-blue-400 font-bold"
                onClick={closeDrawer}
              >
                {item.label}
              </Link>
            ))}
          </Group>

          {/* Buttons */}
          <Group visibleFrom="sm">
            <Button
              variant="default"
              onClick={() => {
                navigate(AppRoutes.PUBLIC.AUTH.LOGIN);
              }}
            >
              Đăng nhập
            </Button>
            <Button
              onClick={() => {
                navigate(AppRoutes.PUBLIC.AUTH.SIGN_UP);
              }}
            >
              Đăng ký
            </Button>
          </Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
          />
        </Group>
      </header>

      {/* Drawer menu cho mobile */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px)" mx="-md">
          <Divider my="sm" />

          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.id}
              smooth={true}
              duration={500}
              spy={true}
              className="cursor-pointer hover:text-blue-400 fw-bold block p-2"
              activeClass="text-blue-400 font-bold"
              onClick={closeDrawer}
            >
              {item.label}
            </Link>
          ))}

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Button
              variant="default"
              onClick={() => {
                navigate(AppRoutes.PUBLIC.AUTH.LOGIN);
              }}
            >
              Đăng nhập
            </Button>
            <Button
              onClick={() => {
                navigate(AppRoutes.PUBLIC.AUTH.SIGN_UP);
              }}
            >
              Đăng ký
            </Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
