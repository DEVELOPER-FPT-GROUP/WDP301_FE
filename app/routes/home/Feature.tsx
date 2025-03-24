import { Box, Grid, Title, Text, Image, Stack, Container } from "@mantine/core";
import { motion } from "framer-motion";
import React from "react";

// Mảng chứa dữ liệu về các tính năng
const featuresData = [
  {
    title: "Hiển thị cây thông minh",
    description:
      "Hệ thống giúp bạn quản lý các thành viên trong gia phả, cập nhật thông tin dễ dàng và hiển thị cây gia đình một cách trực quan.",
    image: "tree.png",
    reverse: false,
  },
  {
    title: "Lưu giữ lịch sử của dòng họ",
    description:
      "Lưu trữ thông tin thế hệ trước, ghi chép các sự kiện quan trọng, giúp thế hệ sau có thể tra cứu nguồn gốc gia đình một cách dễ dàng.",
    image: "tree.png",
    reverse: true,
  },
  {
    title: "Ghi nhớ ngày giỗ, sự kiện quan trọng",
    description:
      "Hệ thống tự động nhắc nhở các ngày lễ, giỗ tổ, sinh nhật, giúp duy trì sự kết nối giữa các thành viên trong gia đình.",
    image: "event.png",
    reverse: false,
  },
  {
    title: "Tích hợp công nghệ AI trong phân tích gia phả",
    description:
      "Ứng dụng AI giúp phân tích mối quan hệ gia đình, gợi ý kết nối và hiển thị các thống kê hữu ích về dòng họ.",
    image: "tree.png",
    reverse: true,
  },
];

const Feature = () => {
  return (
    <Box
      id="feature"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 0",
      }}
    >
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false }} // Luôn chạy lại khi cuộn đến
        >
          <Title
            order={1}
            size={50}
            fw={700}
            c="brown"
            ta="center"
            mb="md"
            style={{
              fontFamily: "'Be Vietnam Pro', 'Roboto', sans-serif",
              letterSpacing: "1px",
            }}
          >
            Tính năng nổi bật
          </Title>
        </motion.div>

        <Grid gutter="xl" align="center">
          {featuresData.map((feature, index) => (
            <React.Fragment key={index}>
              {/* Nếu reverse = false, hiển thị nội dung bên trái và ảnh bên phải */}
              {!feature.reverse && (
                <>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <motion.div
                      whileInView={{ opacity: 1, x: 0 }}
                      initial={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: false }}
                    >
                      <Stack justify="md" style={{ maxWidth: "500px" }}>
                        <Title
                          order={2}
                          fw={700}
                          c="brown"
                          style={{
                            fontFamily:
                              "'Be Vietnam Pro', 'Roboto', sans-serif",
                            letterSpacing: "1px",
                          }}
                        >
                          {feature.title}
                        </Title>
                        <Text size="lg" c="gray.7">
                          {feature.description}
                        </Text>
                      </Stack>
                    </motion.div>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <motion.div
                      whileInView={{ opacity: 1, scale: 1 }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: false }}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        radius="md"
                        style={{
                          maxWidth: "200px",
                          height: "auto",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        }}
                      />
                    </motion.div>
                  </Grid.Col>
                </>
              )}

              {/* Nếu reverse = true, hiển thị ảnh bên trái và nội dung bên phải */}
              {feature.reverse && (
                <>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <motion.div
                      whileInView={{ opacity: 1, scale: 1 }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: false }}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        radius="md"
                        style={{
                          maxWidth: "200px",
                          height: "auto",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        }}
                      />
                    </motion.div>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <motion.div
                      whileInView={{ opacity: 1, x: 0 }}
                      initial={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: false }}
                    >
                      <Stack justify="md" style={{ maxWidth: "500px" }}>
                        <Title
                          order={2}
                          fw={700}
                          c="brown"
                          style={{
                            fontFamily:
                              "'Be Vietnam Pro', 'Roboto', sans-serif",
                            letterSpacing: "1px",
                          }}
                        >
                          {feature.title}
                        </Title>
                        <Text size="lg" c="gray.7">
                          {feature.description}
                        </Text>
                      </Stack>
                    </motion.div>
                  </Grid.Col>
                </>
              )}
            </React.Fragment>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Feature;
