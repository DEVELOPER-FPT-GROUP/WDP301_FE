import {
  Button,
  Container,
  Grid,
  PasswordInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm, type TransformedValues } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { useNavigate } from "react-router";
import { z } from "zod";
import useLogin from "~/infrastructure/api/hooks/auth/useLogin";
import { AppRoutes } from "~/infrastructure/core/AppRoutes";
import { Constants } from "~/infrastructure/core/constants";

export const meta = () => {
  return [{ title: "Đăng ký" }];
};

const SignUp = () => {
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
    console.log(values);

    // loginRequest(values); // mở comment dòng này khi code thật

    // Khi code thì comment đoạn dưới này lại vì đây là code giả lập login
    localStorage.setItem(Constants.API_ACCESS_TOKEN_KEY, "123");
    window.location.href = "/family-tree";
  };
  return (
    <Container
      fluid
      className="h-screen flex items-center justify-center bg-gray-200"
    >
      <Grid className="h-screen w-screen">
        {/* Cột bên trái - Hình ảnh */}
        <Grid.Col
          span={7}
          className="h-screen bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/test.jpg')" }}
        />

        {/* Cột bên phải - Form đăng nhập */}
        <Grid.Col
          span={5}
          className="flex justify-center items-center h-screen bg-white"
        >
          <div>
            <div className="text-center mb-8 max-w-lg">
              <h1 className="text-3xl font-bold uppercase text-gray-800">
                Đăng kí để trải nghiệm{" "}
                <span className="text-blue-600">Gia Phả Thông Minh</span>
              </h1>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  label="Tên đăng nhập"
                  placeholder="Nhập tên đăng nhập"
                  withAsterisk
                  {...form.getInputProps("username")}
                />
                <PasswordInput
                  label="Mật khẩu"
                  withAsterisk
                  placeholder="Nhập mật khẩu"
                  {...form.getInputProps("password")}
                />
                <PasswordInput
                  label="Xác nhận mật khẩu"
                  withAsterisk
                  placeholder="Nhập mật khẩu"
                  {...form.getInputProps("password")}
                />
                <Button type="submit" loading={isPending}>
                  Đăng ký
                </Button>
                <div className="text-center text-sm mt-4">
                  Đã có tài khoản?
                  <a
                    href={AppRoutes.PUBLIC.AUTH.LOGIN}
                    className="text-blue-500 hover:underline ml-1"
                  >
                    Đăng nhập ngay
                  </a>
                </div>
              </Stack>
            </form>
          </div>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default SignUp;
