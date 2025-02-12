import { Box, Title, Paper, Button, Grid, Text } from "@mantine/core";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { AppRoutes } from "~/infrastructure/core/AppRoutes";

const pricingPlans = [
  {
    name: "Gói Cơ Bản",
    price: "99.000đ / tháng",
    features: [
      "Truy cập các tính năng cơ bản",
      "Giới hạn 1000 thành viên",
      "Hỗ trợ khách hàng qua email",
    ],
    buttonText: "Dùng thử ngay",
  },
  {
    name: "Gói Nâng Cao",
    price: "149.000đ / tháng",
    features: [
      "Mở rộng tính năng cao cấp",
      "Không giới hạn thành viên",
      "Ưu tiên hỗ trợ khách hàng",
    ],
    buttonText: "Dùng thử ngay",
  },
  {
    name: "Gói VIP",
    price: "249.000đ / tháng",
    features: [
      "Tất cả tính năng nâng cao",
      "Có sự hỗ trợ của AI",
      "Hỗ trợ khách hàng 24/7",
    ],
    buttonText: "Dùng thử ngay",
  },
  {
    name: "Gói Trọn Đời",
    price: "6.000.000đ (1 lần)",
    features: [
      "Quyền truy cập trọn đời",
      "Tất cả tính năng cao cấp",
      "Hỗ trợ khách hàng vĩnh viễn",
    ],
    buttonText: "Dùng thử ngay",
  },
];

const Price = () => {
  const navigate = useNavigate();
  return (
    <Box
      id="price"
      style={{
        padding: "100px 0",
        textAlign: "center",
      }}
    >
      {/* Tiêu đề */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false }}
      >
        <Title
          order={1}
          size={50}
          fw={900}
          c="brown"
          mb="xl"
          style={{
            fontFamily: "'Pacifico', cursive",
            lineHeight: "1.3",
          }}
        >
          Bảng giá
        </Title>
      </motion.div>

      {/* Grid 4 gói dịch vụ */}
      <Grid gutter="xl">
        {pricingPlans.map((plan, index) => (
          <Grid.Col key={index} span={{ base: 12, md: 6, lg: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.2,
                ease: "easeOut",
              }}
              viewport={{ once: false }}
            >
              <Paper
                shadow="lg"
                radius="md"
                p="xl"
                style={{
                  textAlign: "center",
                  border: "3px solid brown",
                }}
              >
                <Title order={2} size={30} fw={800}>
                  {plan.name}
                </Title>
                <Text size="xl" fw={700} mt="md">
                  {plan.price}
                </Text>

                {/* Danh sách tính năng */}
                <Box mt="lg" style={{ textAlign: "left" }}>
                  {plan.features.map((feature, i) => (
                    <Text key={i} size="sm">
                      ✅ {feature}
                    </Text>
                  ))}
                </Box>

                {/* Nút đăng ký */}
                <Button
                  mt="lg"
                  size="lg"
                  radius="xl"
                  style={{
                    background: "brown",
                    color: "#fff",
                    fontWeight: "bold",
                    marginTop: "20px",
                  }}
                  onClick={() => {
                    navigate(AppRoutes.PUBLIC.AUTH.SIGN_UP);
                  }}
                >
                  {plan.buttonText}
                </Button>
              </Paper>
            </motion.div>
          </Grid.Col>
        ))}
      </Grid>
    </Box>
  );
};

export default Price;
