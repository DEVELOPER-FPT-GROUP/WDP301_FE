import { Header } from "~/infrastructure/common/components/public";
import Feature from "./Feature";
import HomePage from "./HomePage";
import Feedback from "./Feedback";
import New from "./New";
import Contact from "./Contact";
import { Container } from "@mantine/core";
import Price from "./Price";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";

export const meta = () => {
  return [{ title: "Gia Phả Thông Minh" }];
};

function Home() {
  const endpoint = "/trackings/increment-view";
  const { data, isLoading, isFetching, refetch } = useGetApi({
    queryKey: ["traffic"],
    endpoint,
  });
  // console.log(data);

  return (
    <Container size="xl">
      <Header />
      <HomePage />
      <Feature />
      <Price />
      <Feedback />
      <New />
      <Contact />
    </Container>
  );
}

export default Home;
