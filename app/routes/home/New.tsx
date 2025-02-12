import { Carousel } from "@mantine/carousel";
import { Box, Image, Text, Title, Paper, Avatar, Group } from "@mantine/core";
import { useRef } from "react";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";

const news = [
  {
    title: "Hướng dẫn sử dụng",
    image: "test.jpg",
    author: {
      name: "kkkk",
      avatar: "test.jpg",
      date: "10 Jan 2023",
      readTime: "2 phút đọc",
    },
    url: "https://www.facebook.com/profile.php?id=61573126883257",
  },
  {
    title: "Cách tối ưu cây sao cho hợp lý",
    image: "test.jpg",
    author: {
      name: "kkk",
      avatar: "test.jpg",
      date: "15 Feb 2023",
      readTime: "3 phút đọc",
    },
    url: "https://www.facebook.com/profile.php?id=61573126883257",
  },
  {
    title: "Bản cập nhật mới có gì",
    image: "test.jpg",
    author: {
      name: "kkk",
      avatar: "test.jpg",
      date: "22 Mar 2023",
      readTime: "4 phút đọc",
    },
    url: "https://www.facebook.com/profile.php?id=61573126883257",
  },
  {
    title: "Ra mắt tính năng ChatBot",
    image: "test.jpg",
    author: {
      name: "kkk",
      avatar: "test.jpg",
      date: "22 Mar 2023",
      readTime: "4 phút đọc",
    },
    url: "https://www.facebook.com/profile.php?id=61573126883257",
  },
];

const New = () => {
  const autoplay = useRef(Autoplay({ delay: 4000 }));

  return (
    <Box
      id="new"
      style={{
        padding: "80px 10px",
        textAlign: "center",
      }}
    >
      {/* Hiệu ứng tiêu đề */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", type: "spring" }}
        viewport={{ once: false }}
      >
        <Title
          order={1}
          size={50}
          fw={900}
          c="brown"
          ta="center"
          mb="md"
          style={{
            fontFamily: "'Pacifico', cursive",
            letterSpacing: "1px",
          }}
        >
          Tin tức cộng đồng
        </Title>
        <Text
          size="lg"
          c="gray.7"
          fw={500}
          ta="center"
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          Cùng cập nhật những thông báo, tin tức và các chia sẻ từ người dùng
        </Text>
      </motion.div>

      {/* Hiệu ứng Carousel */}
      <Carousel
        slideSize="33.333333%"
        slideGap="md"
        align="center"
        loop={true}
        withIndicators
        withControls={true}
        plugins={[autoplay.current]}
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={autoplay.current.reset}
        styles={{
          indicator: { backgroundColor: "brown" },
        }}
      >
        {news.map((item, index) => (
          <Carousel.Slide key={index}>
            {/* Hiệu ứng từng Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.2,
                ease: "easeOut",
              }}
              viewport={{ once: false }}
              whileHover={{ scale: 1.03 }}
            >
              <Paper
                shadow="lg"
                radius="md"
                p="lg"
                style={{
                  background: "#fff",
                  textAlign: "left", // Căn nội dung sang trái
                  transition: "transform 0.3s ease",
                  borderRadius: "12px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start", // Đẩy nội dung về phía trái
                  alignItems: "flex-start",
                  cursor: "pointer",
                }}
                onClick={() => window.open(item.url, "_blank")}
              >
                {/* Ảnh bài viết */}
                <Image
                  src={item.image}
                  alt={item.title}
                  width="50%"
                  height={70}
                  radius="md"
                  style={{
                    objectFit: "cover",
                    alignSelf: "flex-start",
                  }}
                />

                <Box p="md">
                  <Title order={3} fw={700} c="black" mt="xs">
                    {item.title}
                  </Title>
                  {/* Tác giả & thời gian đọc */}
                  <Group mt="md" justify="sm" align="center">
                    <Avatar src={item.author.avatar} size={30} radius="xl" />{" "}
                    {/* Giảm kích thước avatar */}
                    <Box>
                      <Text size="sm" fw={600}>
                        {item.author.name}
                      </Text>
                      <Text size="xs" c="gray.5">
                        {item.author.date} • {item.author.readTime}
                      </Text>
                    </Box>
                  </Group>
                </Box>
              </Paper>
            </motion.div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
};

export default New;
