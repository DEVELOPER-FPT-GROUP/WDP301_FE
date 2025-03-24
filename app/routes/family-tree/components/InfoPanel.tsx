import React, { useMemo, useState } from "react";
import {
  Paper,
  Title,
  Button,
  Group,
  Text,
  Image,
  Stack,
  Badge,
  ActionIcon,
  Box,
  Menu,
  Tooltip,
} from "@mantine/core";
import {
  IconX,
  IconUserPlus,
  IconBabyCarriage,
  IconTrash,
  IconEdit,
  IconEye,
  IconMenu2,
} from "@tabler/icons-react";
import {
  defaultImageUrl,
  defaultMaleImageUrl,
  defaultFemaleImageUrl,
} from "../constants/defaults";
import type { Node } from "../types/node";
import {
  formatNormalDate,
  getDataFromToken,
} from "~/infrastructure/utils/common";

interface InfoPanelProps {
  node: Node | null;
  onClose: () => void;
  onAddSpouse?: (node: Node) => void;
  onAddChild?: (node: Node) => void;
  onDeleteNode?: (node: Node) => void;
  onEditNode?: (node: Node) => void;
  onViewNode?: (node: Node) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  node,
  onClose,
  onAddSpouse,
  onAddChild,
  onDeleteNode,
  onEditNode,
  onViewNode,
}) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const dataToken = useMemo(() => {
    try {
      const token = getDataFromToken();
      return token || { familyId: null, role: null };
    } catch (error) {
      console.error("Error getting token data:", error);
      return { familyId: null, role: null };
    }
  }, []);

  const isReadOnly = dataToken.role === "family_member";

  if (!node) return null;

  const isAlreadyPartner =
    (node.gender === "male" && node.generation === 0) ||
    node.generation > 0 ||
    (node.parent &&
      node.parentRelation &&
      node.parentRelation.partner === node);
  // Check if node has any married relationships
  const hasMarriedRelationship =
    node.relationships && node.relationships.some((rel) => rel.isMarried);

  // Determine spouse text based on gender
  const spouseText = node.gender === "female" ? "Thêm Chồng" : "Thêm Vợ";

  // Determine if we need to show buttons
  const showAddSpouse = isAlreadyPartner && onAddSpouse;
  const showAddChild = hasMarriedRelationship && onAddChild;

  // Determine default image based on gender
  const getDefaultImage = () => {
    if (node.gender === "male") return defaultMaleImageUrl;
    if (node.gender === "female") return defaultFemaleImageUrl;
    return defaultImageUrl;
  };

  return (
    <Paper
      shadow="md"
      p="md"
      style={{
        position: "absolute",
        top: 80,
        right: 20,
        width: 350,
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
        zIndex: 1000,
        backgroundColor: "white",
        borderRadius: "8px",
      }}
    >
      <Group justify="space-between" mb="md">
        <Title order={4}>Thông tin thành viên</Title>
        <Button
          variant="subtle"
          color="gray"
          p={0}
          onClick={onClose}
          style={{ minWidth: "auto" }}
        >
          <IconX size={20} />
        </Button>
      </Group>

      <Stack gap="md">
        {/* Image container with action menu */}
        <Box pos="relative" style={{ width: "fit-content", margin: "0 auto" }}>
          <Image
            src={node.image || getDefaultImage()}
            height={150}
            fit="contain"
            radius="md"
            mx="auto"
            alt={node.name}
            style={{
              maxWidth: "200px",
              filter:
                node.isAlive === false ? "grayscale(70%) opacity(0.7)" : "none",
            }}
          />
          {isReadOnly ? (
            <Tooltip
              label="Xem chi tiết thành viên"
              position="top"
              withArrow
              arrowPosition="center"
              offset={5}
              withinPortal
              zIndex={2000}
            >
              <ActionIcon
                color="blue"
                variant="filled"
                radius="xl"
                size="lg"
                style={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                  zIndex: 1010,
                }}
                onClick={() => onViewNode && onViewNode(node)}
              >
                <IconEye size="1.2rem" />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Menu
              shadow="md"
              width={200}
              position="bottom-end"
              offset={5}
              opened={menuOpened}
              onChange={setMenuOpened}
              withinPortal={true}
              zIndex={2000}
            >
              <Menu.Target>
                <ActionIcon
                  color="blue"
                  variant="filled"
                  radius="xl"
                  size="lg"
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                  }}
                  onClick={() => setMenuOpened((o) => !o)}
                >
                  <IconMenu2 size="1.2rem" />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                {onViewNode && (
                  <Menu.Item
                    leftSection={<IconEye size={16} />}
                    onClick={() => {
                      onViewNode(node);
                      setMenuOpened(false);
                    }}
                  >
                    Xem chi tiết
                  </Menu.Item>
                )}

                {onEditNode && (
                  <Menu.Item
                    leftSection={<IconEdit size={16} />}
                    onClick={() => {
                      onEditNode(node);
                      setMenuOpened(false);
                    }}
                  >
                    Chỉnh sửa
                  </Menu.Item>
                )}

                {onDeleteNode &&
                  !(node.gender === "male" && node.generation === 0) && (
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      onClick={() => {
                        onDeleteNode(node);
                        setMenuOpened(false);
                      }}
                    >
                      Xóa
                    </Menu.Item>
                  )}
              </Menu.Dropdown>
            </Menu>
          )}
        </Box>

        <Title order={3} ta="center" mt="sm">
          {node.name}
        </Title>

        {node.gender && (
          <Group justify="center">
            <Badge
              color={node.gender === "female" ? "pink" : "blue"}
              size="lg"
              variant="light"
            >
              {node.gender === "female" ? "Nữ" : "Nam"}
            </Badge>

            {node.isAlive === false && (
              <Badge color="gray" size="lg" variant="light">
                Đã mất
              </Badge>
            )}
          </Group>
        )}

        {node.dateOfBirth && (
          <Text size="sm">
            <strong>Ngày sinh:</strong> {formatNormalDate(node.dateOfBirth)}
          </Text>
        )}

        {node.dateOfDeath && (
          <Text size="sm">
            <strong>Ngày mất:</strong> {formatNormalDate(node.dateOfDeath)}
          </Text>
        )}

        {/* Action buttons */}
        {(showAddSpouse || showAddChild) && isReadOnly === false && (
          <Group grow mt="md">
            {showAddSpouse && (
              <Button
                leftSection={<IconUserPlus size={16} />}
                onClick={() => onAddSpouse(node)}
                variant="light"
                color="blue"
              >
                {spouseText}
              </Button>
            )}

            {showAddChild && (
              <Button
                leftSection={<IconBabyCarriage size={16} />}
                onClick={() => onAddChild(node)}
                variant="light"
                color="green"
              >
                Thêm con
              </Button>
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
};

export default InfoPanel;
