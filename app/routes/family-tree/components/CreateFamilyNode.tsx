import React, { useState } from "react";
import { Button, Modal, TextInput, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePostApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";

type CreateFamilyNodeProps = {
  data: {
    label: string;
  };
  onFamilyCreated?: (newFamilyId: string) => void;
};

export const CreateFamilyNode: React.FC<CreateFamilyNodeProps> = ({
  data,
  onFamilyCreated,
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [isCreating, setIsCreating] = useState(false);
  const [familyName, setFamilyName] = useState("Gia đình mới");

  const { mutateAsync } = usePostApi({
    endpoint: "families/create-family",
  });

  // Thêm bộ ngăn chặn sự kiện để đảm bảo sự kiện click không bị ReactFlow chặn
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    open();
  };

  const handleCreateFamily = async () => {
    try {
      setIsCreating(true);
      const response = await mutateAsync({
        familyName: familyName,
        createdBy: localStorage.getItem("userId") || "HE171216",
        createdDate: new Date().toISOString(),
      });

      if (response.data?.familyId) {
        if (onFamilyCreated) {
          onFamilyCreated(response.data.familyId);
        } else {
          localStorage.setItem("familyId", response.data.familyId);
          window.location.reload();
        }
      }
      close();
    } catch (error) {
      console.error("Lỗi khi tạo gia đình mới:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div
        className="create-family-node"
        onClick={handleButtonClick} // Thêm sự kiện click cho cả node
        style={{ cursor: "pointer" }}
      >
        <div className="create-family-content">
          <h3>Bạn chưa có cây gia đình</h3>
          <Button
            onClick={handleButtonClick}
            color="green"
            size="md"
            className="create-family-button"
          >
            {data.label}
          </Button>
        </div>
      </div>

      {/* Modal tạo gia đình mới */}
      <Modal
        opened={opened}
        onClose={close}
        title="Tạo gia đình mới"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack>
          <TextInput
            label="Tên gia đình"
            placeholder="Nhập tên gia đình"
            value={familyName}
            onChange={(e) => setFamilyName(e.currentTarget.value)}
            required
          />

          <Group align="right" mt="md">
            <Button variant="outline" onClick={close}>
              Hủy
            </Button>
            <Button
              onClick={handleCreateFamily}
              loading={isCreating}
              color="brown"
            >
              Tạo gia đình
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
