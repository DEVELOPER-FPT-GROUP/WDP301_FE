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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);

  const dataToken = useMemo(() => {
    try {
      const token = getDataFromToken();
      return token || { familyId: null, role: null, familyName: null };
    } catch (error) {
      console.error("Error getting token data:", error);
      return { familyId: null, role: null, familyName: null };
    }
  }, []);

  const { data, isSuccess, isLoading, refetch, isFetching } = useGetApi({
    queryKey: ["family-tree", dataToken.familyId],
    endpoint: "members/get-members-in-family/:id",
    urlParams: { id: dataToken.familyId },
  });

  // Check if data is being loaded (initial load or refetch)
  const isDataLoading = isLoading || isFetching;

  // Format data từ API và convert media sang image nếu có
  const formattedRoot = useMemo(() => {
    if (isSuccess && data && data.data) {
      const processNode = (node: any): Node => {
        const processedNode = { ...node };

        if (node.media && Array.isArray(node.media) && node.media.length > 0) {
          processedNode.image = node.media[0];
        }

        if (node.relationships && Array.isArray(node.relationships)) {
          processedNode.relationships = node.relationships.map((rel: any) => {
            const processedRel = { ...rel };
            if (rel.partner) {
              processedRel.partner = processNode(rel.partner);
            }
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

      return processNode(data.data);
    }
    return null;
  }, [data, isSuccess]);

  // Hàm xử lý khi node được click
  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setIsInfoPanelOpen(true);
  };

  // Hàm đệ quy để clone cây và thêm hàm onClick,
  // đồng thời gán thêm thông tin cha (parent) và quan hệ của cha (parentRelation) cho các node partner & children.
  const enhancedRoot = useMemo(() => {
    if (!formattedRoot) return null;

    const addOnClick = (
      node: Node,
      parent?: Node,
      parentRelation?: any
    ): Node => {
      // Tạo bản sao của node và gán thêm thông tin parent
      const nodeCopy = { ...node, parent, parentRelation };

      nodeCopy.onClick = (clickedNode) => {
        handleNodeClick(clickedNode);
        if (node.onClick) node.onClick(clickedNode);
      };

      if (nodeCopy.relationships) {
        nodeCopy.relationships = nodeCopy.relationships.map((rel) => {
          const relCopy = { ...rel };

          // Nếu có partner, truyền nodeCopy làm parent cho partner
          if (relCopy.partner) {
            relCopy.partner = addOnClick(relCopy.partner, nodeCopy, relCopy);
          }

          // Các con sẽ được gán thông tin parent là node hiện tại và parentRelation là relCopy.
          if (relCopy.children) {
            relCopy.children = relCopy.children.map((child) =>
              addOnClick(child, nodeCopy, relCopy)
            );
          }
          return relCopy;
        });
      }
      return nodeCopy;
    };

    return addOnClick(formattedRoot);
  }, [formattedRoot]);

  // Cập nhật selectedNode khi dữ liệu mới được load
  useEffect(() => {
    if (isSuccess && data && data.data && selectedNode) {
      const findNodeById = (node: any, id: any): any => {
        if (node.id === id) return node;
        if (node.relationships) {
          for (const rel of node.relationships) {
            if (rel.partner && rel.partner.id === id) {
              return rel.partner;
            }
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

      const updatedNode = findNodeById(data.data, selectedNode.id);
      if (updatedNode) {
        const processNode = (node: any): Node => {
          const processedNode = { ...node };
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
    refetch();
  };

  const closeInfoPanel = () => {
    setIsInfoPanelOpen(false);
  };

  const handleAddSpouse = (node: Node) => {
    setNodeForAddSpouse(node);
    setIsAddSpouseModalOpen(true);
  };

  const handleAddChild = (node: Node) => {
    setNodeForAddChild(node);
    setIsAddChildModalOpen(true);
  };

  const handleViewNode = (node: Node) => {
    navigate("/detail-member", {
      state: {
        memberId: node.id,
      },
    });
  };

  const handleEditNode = (node: Node) => {
    console.log("Chỉnh sửa node:", node);
    setEditMemberId(String(node.id));
    setIsEditModalOpen(true);
  };

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
  // test
  return (
    <div ref={canvasContainerRef} style={{ width: "100%", height: "100vh" }}>
      {enhancedRoot && !isDataLoading && (
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

      {isDataLoading ? (
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
      {isInfoPanelOpen && selectedNode && !isDataLoading && (
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
            refetch();
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
            refetch();
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
