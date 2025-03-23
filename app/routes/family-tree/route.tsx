import React, { useMemo, useState, useEffect, useRef } from "react";
import type { Node } from "./types/node";
import FamilyTree from "./components/FamilyTree";
import DownloadModal from "./components/DownloadModal";
import { Button, Group, Text, Loader, Center, Title } from "@mantine/core";
import InfoPanel from "./components/InfoPanel";
import { useGetApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { getDataFromToken } from "~/infrastructure/utils/common";
import CreateFamilyLeaderForm from "../../infrastructure/common/components/component/CreateFamilyLeaderForm";
import AddSpouseModal from "../../infrastructure/common/components/component/AddSpouseForm";
import AddChildModal from "../../infrastructure/common/components/component/AddChildModal";
import DeleteMemberModal from "../../infrastructure/common/components/component/DeleteMemberModal";
import EditDetailMemberModal from "../../infrastructure/common/components/component/EditDetailMemberModal";
import { useNavigate } from "react-router";

export const meta = () => {
  return [{ title: "Cây Gia Đình" }];
};

const TreePage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<Node | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);

  const [isAddSpouseModalOpen, setIsAddSpouseModalOpen] = useState(false);
  const [nodeForAddSpouse, setNodeForAddSpouse] = useState<Node | null>(null);

  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [nodeForAddChild, setNodeForAddChild] = useState<Node | null>(null);

  // Add state for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);

  // Safely get dataToken and handle potential null
  const dataToken = useMemo(() => {
    try {
      const token = getDataFromToken();
      return token || { familyId: null, role: null };
    } catch (error) {
      console.error("Error getting token data:", error);
      return { familyId: null, role: null };
    }
  }, []);

  // Only call the API if we have a familyId
  const { data, isSuccess, isLoading, refetch } = useGetApi({
    queryKey: ["family-tree", dataToken.familyId],
    endpoint: "members/get-members-in-family/:id",
    urlParams: { id: dataToken.familyId },
  });

  // Format data from API to handle media array and convert to image property
  const formattedRoot = useMemo(() => {
    // If API data exists, process it and use that instead
    if (isSuccess && data && data.data) {
      // Deep clone and format the data
      const processNode = (node: any): Node => {
        const processedNode = { ...node };

        // Convert media to image if it exists and has elements
        if (node.media && Array.isArray(node.media) && node.media.length > 0) {
          processedNode.image = node.media[0];
        }

        // Process relationships recursively
        if (node.relationships && Array.isArray(node.relationships)) {
          processedNode.relationships = node.relationships.map((rel: any) => {
            const processedRel = { ...rel };

            // Process partner
            if (rel.partner) {
              processedRel.partner = processNode(rel.partner);
            }

            // Process children
            if (rel.children && Array.isArray(rel.children)) {
              processedRel.children = rel.children.map((child: any) =>
                processNode(child)
              );
            }

            return processedRel;
          });
        }

        return processedNode;
      };

      // Process the entire tree
      return processNode(data.data);
    }

    // Return null if API data is not available
    return null;
  }, [data, isSuccess]);

  // Hàm xử lý khi node được click
  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setIsInfoPanelOpen(true);
  };

  // Clone cấu trúc cây và thêm hàm onClick để bắt sự kiện
  const enhancedRoot = useMemo(() => {
    // Nếu không có dữ liệu, trả về null
    if (!formattedRoot) return null;

    // Hàm đệ quy để thêm onClick cho tất cả các node
    const addOnClick = (node: Node): Node => {
      // Tạo bản sao của node
      const nodeCopy = { ...node };

      // Thêm/ghi đè hàm onClick
      nodeCopy.onClick = (clickedNode) => {
        handleNodeClick(clickedNode);
        // Gọi hàm onClick gốc nếu có
        if (node.onClick) node.onClick(clickedNode);
      };

      // Xử lý đệ quy cho các mối quan hệ và con cháu
      if (nodeCopy.relationships) {
        nodeCopy.relationships = nodeCopy.relationships.map((rel) => {
          const relCopy = { ...rel };

          // Xử lý partner
          if (relCopy.partner) {
            relCopy.partner = addOnClick(relCopy.partner);
          }

          // Xử lý children
          if (relCopy.children) {
            relCopy.children = relCopy.children.map((child) =>
              addOnClick(child)
            );
          }

          return relCopy;
        });
      }

      return nodeCopy;
    };

    // Trả về cây đã được nâng cao
    return addOnClick(formattedRoot);
  }, [formattedRoot]);

  // Thêm useEffect để cập nhật selectedNode khi dữ liệu thay đổi
  useEffect(() => {
    if (isSuccess && data && data.data && selectedNode) {
      // Hàm tìm node trong cây mới dựa theo ID của node đã chọn
      const findNodeById = (node: any, id: any): any => {
        if (node.id === id) return node;

        if (node.relationships) {
          for (const rel of node.relationships) {
            // Tìm trong partner
            if (rel.partner && rel.partner.id === id) {
              return rel.partner;
            }

            // Tìm trong children
            if (rel.children) {
              for (const child of rel.children) {
                const found = findNodeById(child, id);
                if (found) return found;
              }
            }
          }
        }
        return null;
      };

      // Tìm và cập nhật lại selectedNode từ dữ liệu mới
      const updatedNode = findNodeById(data.data, selectedNode.id);
      if (updatedNode) {
        // Process the updated node to ensure it has the same structure
        const processNode = (node: any): Node => {
          const processedNode = { ...node };

          // Convert media to image if it exists and has elements
          if (
            node.media &&
            Array.isArray(node.media) &&
            node.media.length > 0
          ) {
            processedNode.image = node.media[0];
          }

          return processedNode;
        };

        setSelectedNode(processNode(updatedNode));
      }
    }
  }, [data, isSuccess, selectedNode?.id]);

  const handleFamilyLeaderCreated = () => {
    // After creating a family leader, refresh the data
    refetch();
  };

  // Hàm đóng cửa sổ thông tin
  const closeInfoPanel = () => {
    setIsInfoPanelOpen(false);
  };

  // Hàm xử lý thêm vợ/chồng
  const handleAddSpouse = (node: Node) => {
    setNodeForAddSpouse(node);
    setIsAddSpouseModalOpen(true);
  };

  // Hàm xử lý thêm con
  const handleAddChild = (node: Node) => {
    setNodeForAddChild(node);
    setIsAddChildModalOpen(true);
  };

  // Hàm xử lý xem chi tiết node
  const handleViewNode = (node: Node) => {
    navigate("/detail-member", {
      state: {
        memberId: node.id,
      },
    });
  };

  // Update handleEditNode to open the edit modal
  const handleEditNode = (node: Node) => {
    console.log("Chỉnh sửa node:", node);
    setEditMemberId(String(node.id));
    setIsEditModalOpen(true);
  };

  // Hàm mở xác nhận xóa node
  const handleDeleteNode = (node: Node) => {
    setNodeToDelete(node);
    setIsDeleteModalOpen(true);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (canvasContainerRef.current) {
      const { clientWidth, clientHeight } = canvasContainerRef.current;
      setCanvasSize({ width: clientWidth, height: clientHeight });
    }
  }, [canvasContainerRef.current]);

  const treeOptions = useMemo(
    () => ({
      id: "canvas",
      width: canvasSize.width,
      height: canvasSize.height,
      boundToParentSize: true,
    }),
    [canvasSize]
  );

  // If there's no familyId, we need to notify the user
  if (!dataToken.familyId) {
    return (
      <div style={{ padding: "2rem" }}>
        <Title order={2} mb="md">
          Tạo Trưởng Họ
        </Title>
        <Text mb="md">Bạn cần tạo trưởng họ để bắt đầu cây gia phả.</Text>
        <CreateFamilyLeaderForm onSuccess={handleFamilyLeaderCreated} />
      </div>
    );
  }

  return (
    <div ref={canvasContainerRef} style={{ width: "100%", height: "100vh" }}>
      {/* Chỉ hiển thị tiêu đề khi có dữ liệu */}
      {enhancedRoot && (
        <Group justify="space-between" align="center" mb="md">
          <Group>
            <h1>
              {dataToken.familyName
                ? "Dòng họ " + dataToken.familyName
                : "Cây gia phả"}{" "}
            </h1>
          </Group>
          <Button onClick={openModal} variant="light">
            Tải xuống
          </Button>
        </Group>
      )}

      {isLoading ? (
        <Center style={{ width: "100%", height: "70vh" }}>
          <Loader size="xl" />
        </Center>
      ) : isSuccess && data && data.data === null ? (
        <Center style={{ width: "100%", height: "70vh" }}>
          <div
            style={{ maxWidth: "600px", width: "100%", textAlign: "center" }}
          >
            <CreateFamilyLeaderForm
              onSuccess={handleFamilyLeaderCreated}
              familyId={dataToken.familyId}
            />
          </div>
        </Center>
      ) : enhancedRoot ? (
        <FamilyTree root={enhancedRoot} options={treeOptions} />
      ) : null}

      <DownloadModal
        isOpen={isModalOpen}
        onClose={closeModal}
        canvasId="canvas"
      />
      {isInfoPanelOpen && selectedNode && (
        <InfoPanel
          node={selectedNode}
          onClose={closeInfoPanel}
          onAddSpouse={handleAddSpouse}
          onAddChild={handleAddChild}
          onDeleteNode={handleDeleteNode}
          onEditNode={handleEditNode}
          onViewNode={handleViewNode}
        />
      )}
      {nodeForAddSpouse && (
        <AddSpouseModal
          opened={isAddSpouseModalOpen}
          onClose={() => setIsAddSpouseModalOpen(false)}
          memberId={String(nodeForAddSpouse.id)}
          gender={nodeForAddSpouse.gender}
          onSuccess={() => {
            setIsAddSpouseModalOpen(false);
            refetch(); // Để cập nhật dữ liệu sau khi thêm thành công
          }}
          name={nodeForAddSpouse.name}
        />
      )}
      {nodeForAddChild && (
        <AddChildModal
          opened={isAddChildModalOpen}
          onClose={() => setIsAddChildModalOpen(false)}
          parentId={String(nodeForAddChild.id)}
          name={nodeForAddChild.name}
          onSuccess={() => {
            setIsAddChildModalOpen(false);
            refetch(); // To refresh the data after adding a child
          }}
        />
      )}
      {nodeToDelete && (
        <DeleteMemberModal
          opened={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          memberId={String(nodeToDelete.id)}
          memberName={nodeToDelete.name}
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            setIsInfoPanelOpen(false);
            refetch();
          }}
        />
      )}
      {/* Only render EditDetailMemberModal when editMemberId exists */}
      {editMemberId && (
        <EditDetailMemberModal
          opened={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditMemberId(null);
          }}
          memberId={editMemberId}
          refreshState={() => {
            refetch();
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default TreePage;
