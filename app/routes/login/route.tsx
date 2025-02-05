import {
	Box,
	Button,
	Container,
	Paper,
	PasswordInput,
	Stack,
	TextInput,
} from "@mantine/core";
import { type TransformedValues, useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { useNavigate } from "react-router";
import { z } from "zod";
import useLogin from "~/infrastructure/api/hooks/auth/useLogin";
import { AppRoutes } from "~/infrastructure/core/AppRoutes";
import { Constants } from "~/infrastructure/core/constants";

export const meta = () => {
	return [{ title: "Login" }];
};

const Login = () => {
	const navigate = useNavigate();

	const { mutate: loginRequest, isPending } = useLogin({
		onSuccess: (data) => {
			localStorage.setItem(Constants.API_ACCESS_TOKEN_KEY, data.accessToken);
			localStorage.setItem(Constants.API_REFRESH_TOKEN_KEY, data.refreshToken);
			localStorage.setItem(Constants.API_ROLE, "FAMILY_MEMBER");
			navigate(AppRoutes.PRIVATE.FAMILY_TREE, { replace: true });
		},
	});

	const validationSchema = z.object({
		username: z
			.string()
			.min(1, { message: "This field cannot be empty" })
			.max(255, { message: "This field cannot be longer than 255 characters" }),
		password: z.string().min(1, { message: "This field cannot be empty" }),
	});
	const form = useForm({
		initialValues: {
			username: "",
			password: "",
		},
		validate: zodResolver(validationSchema),
	});

	const handleSubmit = (values: TransformedValues<typeof form>) => {
		// loginRequest(values); // mở comment dòng này khi code thật

		// Khi code thì comment đoạn dưới này lại vì đây là code giả lập login
		localStorage.setItem(Constants.API_ACCESS_TOKEN_KEY, "123");
		window.location.href = "/family-tree";
	};
	return (
		<Container fluid>
			<Box className={"flex justify-center items-center h-screen"}>
				<Paper shadow="sm" radius="md" withBorder p="xl" className={"w-1/3"}>
					<h1 className={"text-30-40 text-center font-bold uppercase mb-10"}>
						Login into system
					</h1>
					<form onSubmit={form.onSubmit(handleSubmit)}>
						<Stack>
							<TextInput
								label={"Username"}
								placeholder={"Enter your username"}
								withAsterisk
								{...form.getInputProps("username")}
							/>
							<PasswordInput
								label={"Password"}
								withAsterisk
								placeholder={"Enter your password"}
								{...form.getInputProps("password")}
							/>
							<Button type={"submit"} loading={isPending}>
								Login
							</Button>
						</Stack>
					</form>
				</Paper>
			</Box>
		</Container>
	);
};

export default Login;
