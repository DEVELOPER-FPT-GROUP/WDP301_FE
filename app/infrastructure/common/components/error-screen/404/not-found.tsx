import {
  Button,
  Container,
  Image,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import error from "app/assets/error/404.svg";
import "./not-found.css";

export default function NotFound() {
  return (
    <Container className="py-20 px-4">
      <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 1, sm: 2 }}>
        <Image src={error} className="mobileImage" />
        <div>
          <Title className="title">Something is not right...</Title>
          <Text c="dimmed" size="lg">
            Page you are trying to open does not exist. You may have mistyped
            the address, or the page has been moved to another URL. If you think
            this is an error contact support.
          </Text>
          <Button
            variant="outline"
            size="md"
            mt="xl"
            className="control"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Get back to home page
          </Button>
        </div>
        <Image src={error} className="desktopImage" />
      </SimpleGrid>
    </Container>
  );
}
