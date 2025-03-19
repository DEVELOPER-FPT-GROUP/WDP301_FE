import { Carousel } from "@mantine/carousel";
import { Box, Image, Text, Title, Paper } from "@mantine/core";
import { useRef } from "react";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";

const users = [
  {
    name: "NGUYỄN PHƯƠNG NAM",
    content:
      "Ứng dụng rất hữu ích cho cộng đồng và xã hội. Mong tác giả duy trì và phát triển ứng dụng này lâu dài.",
    image: "test.jpg",
  },
  {
    name: "VĂN NGUYỄN",
    content:
      "Trực quan, dễ sử dụng. Tuy nhiên, cần bổ sung chức năng xuất file cho cây phả hệ và import dữ liệu.",
    image: "test.jpg",
  },
  {
    name: "THU LE XUAN",
    content:
      "Rất cảm ơn nhà phát triển, đã tạo một nơi để các dòng họ được giao lưu và kết nối.",
    image: "test.jpg",
  },
  {
    name: "PHẠM THANH HẢI",
    content:
      "Ứng dụng hoạt động rất tốt. Mong muốn có thêm tính năng chia sẻ phả hệ với người thân một cách dễ dàng hơn.",
    image: "test.jpg",
  },
];

const Feedback = () => {
  const autoplay = useRef(Autoplay({ delay: 3000 }));
  return (
    <Box
      id="feedback"
      style={{
        padding: "80px 10px",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: false }} // Luôn chạy lại khi scroll đến
      >
        <Title
          order={1}
          size={50}
          fw={700}
          c="brown"
          mb="xl"
          style={{
            fontFamily: "'Be Vietnam Pro', 'Roboto', sans-serif",
            lineHeight: "1.3",
          }}
        >
          Cảm nhận của người dùng app
        </Title>
      </motion.div>

      <Carousel
        slideSize="33.333%"
        slideGap="md"
        align="center"
        loop={true}
        withIndicators
        withControls
        plugins={[autoplay.current]}
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={autoplay.current.reset}
        styles={{
          indicator: { backgroundColor: "brown" },
        }}
      >
        {users.map((item, index) => (
          <Carousel.Slide key={index}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: false }} // Luôn chạy lại khi cuộn đến
            >
              <Paper
                shadow="md"
                radius="md"
                p="lg"
                style={{
                  background: "#fff",
                  textAlign: "center",
                  minHeight: "250px",
                  maxHeight: "500px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  overflow: "hidden",
                }}
              >
                {/* Ảnh với hiệu ứng */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: false }} // Luôn chạy lại khi scroll đến
                >
                  <Box
                    w={80}
                    h={80}
                    style={{
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "3px solid white",
                      maxHeight: "80px",
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width="100%"
                      height="100%"
                      style={{
                        objectFit: "cover",
                        maxHeight: "80px",
                      }}
                    />
                  </Box>
                </motion.div>

                <Text size="sm">{item.content}</Text>
                <Text fw={700} c="brown" mt="md">
                  {item.name}
                </Text>
              </Paper>
            </motion.div>
          </Carousel.Slide>
        ))}
      </Carousel>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false }}
      >
        <Title
          order={1}
          size={48}
          fw={700}
          c="brown"
          ta="center"
          mb="xl"
          mt="5xl"
          style={{
            margin: "120px 0 50px",
            fontFamily: "'Be Vietnam Pro', 'Roboto', sans-serif",
            lineHeight: "1.3",
          }}
        >
          "Con người có tổ, có tông
          <br />
          Như cây có cội, như sông có nguồn"
        </Title>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: false }}
      >
        <Text
          size="lg"
          c="gray.7"
          ta="center"
          style={{ maxWidth: "800px", margin: "0 auto", lineHeight: "1.6" }}
        >
          Gia phả là gia bảo lịch sử của tổ tiên nhiều đời truyền lại, là điều
          tổ tiên muốn gửi gắm lại cho đời sau. Bất cứ họ nào, bất cứ con người
          nào trong họ, có tài năng lỗi lạc đến đâu, cá nhân cũng không thể viết
          được toàn bộ gia phả mà chỉ có kế thừa đời trước và truyền dẫn đời
          sau.
        </Text>
      </motion.div>
    </Box>
  );
};

export default Feedback;
