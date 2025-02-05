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
import "./Header.css";
import { useNavigate } from "react-router";
import { AppRoutes } from "~/infrastructure/core/AppRoutes";
export default function Header() {
	const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
		useDisclosure(false);
	const navigate = useNavigate();
	return (
		<Box pb={120}>
			<header className="header">
				<Group justify="space-between" h="100%">
					<MantineLogo size={30} />
					<Group h="100%" gap={0} visibleFrom="sm">
						<a href="#" className="link">
							Home
						</a>
						<a href="#" className="link">
							Feature
						</a>
						<a href="#" className="link">
							Response
						</a>
						<a href="#" className="link">
							About Us
						</a>
					</Group>

					<Group visibleFrom="sm">
						<Button
							variant="default"
							onClick={() => {
								navigate(AppRoutes.PUBLIC.AUTH.LOGIN);
							}}
						>
							Log in
						</Button>
						<Button
							onClick={() => {
								navigate(AppRoutes.PUBLIC.AUTH.SIGN_UP);
							}}
						>
							Sign up
						</Button>
					</Group>

					<Burger
						opened={drawerOpened}
						onClick={toggleDrawer}
						hiddenFrom="sm"
					/>
				</Group>
			</header>

			<Drawer
				opened={drawerOpened}
				onClose={closeDrawer}
				size="100%"
				padding="md"
				title="Navigation"
				hiddenFrom="sm"
				zIndex={1000000}
			>
				<ScrollArea h="calc(100vh - 80px" mx="-md">
					<Divider my="sm" />

					<a href="#" className="link">
						Home
					</a>
					<a href="#" className="link">
						Feature
					</a>
					<a href="#" className="link">
						Response
					</a>
					<a href="#" className="link">
						About Us
					</a>

					<Divider my="sm" />

					<Group justify="center" grow pb="xl" px="md">
						<Button
							variant="default"
							onClick={() => {
								navigate(AppRoutes.PUBLIC.AUTH.LOGIN);
							}}
						>
							Log in
						</Button>
						<Button
							onClick={() => {
								navigate(AppRoutes.PUBLIC.AUTH.SIGN_UP);
							}}
						>
							Sign up
						</Button>
					</Group>
				</ScrollArea>
			</Drawer>
		</Box>
	);
}
