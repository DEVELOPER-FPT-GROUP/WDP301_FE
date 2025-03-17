import React, { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { Node, Relation } from "../types/node";
import { Options } from "../types/options";
import { setupCanvas } from "../utils/canvasUtils";
import {
  createNode,
  drawPartnerLine,
  drawParentLine,
  drawChildLine,
  positionNodes,
  bringNodesToFront,
} from "../utils/drawingUtils";
import { HighlightManager } from "../utils/highlightUtils";
import {
  minimumDistanceBetweenNodes,
  verticalDistanceBetweenNodes,
} from "../constants/styles";

interface FamilyTreeProps {
  root: Node;
  options: Options;
}

const FamilyTree: React.FC<FamilyTreeProps> = ({ root, options }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const highlightManagerRef = useRef<HighlightManager | null>(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const isDrawingRef = useRef<boolean>(false);

  // Khởi tạo canvas - chỉ chạy một lần
  useEffect(() => {
    // Nếu đã khởi tạo canvas trước đó, không khởi tạo lại
    if (fabricCanvasRef.current) return;

    const initializeCanvas = () => {
      try {
        if (!document.getElementById(options.id)) return;

        // Tạo canvas mới
        const canvas = new fabric.Canvas(options.id, {
          width: options.width,
          height: options.height,
          hoverCursor: "pointer",
          selection: false,
          allowTouchScrolling: true,
          enableRetinaScaling: false,
          isDrawingMode: false,
        });

        fabricCanvasRef.current = canvas;
        setupCanvas(canvas);
        highlightManagerRef.current = new HighlightManager(canvas);
        setCanvasInitialized(true);
      } catch (err) {
        console.error("Lỗi khởi tạo canvas:", err);
      }
    };

    // Sử dụng setTimeout để đảm bảo DOM đã sẵn sàng
    const timer = setTimeout(initializeCanvas, 100);

    return () => {
      clearTimeout(timer);
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.dispose();
        } catch (err) {
          console.error("Lỗi giải phóng canvas:", err);
        }
        fabricCanvasRef.current = null;
        setCanvasInitialized(false);
      }
    };
  }, [options.id]);

  // THÊM useEffect mới để lưu tham chiếu canvas
  useEffect(() => {
    if (!canvasInitialized || !fabricCanvasRef.current) return;

    // Lưu tham chiếu canvas để có thể truy cập từ bên ngoài
    if (typeof window !== "undefined") {
      if (!(window as any).__canvases) {
        (window as any).__canvases = {};
      }
      (window as any).__canvases[options.id] = fabricCanvasRef.current;
    }

    return () => {
      if (typeof window !== "undefined" && (window as any).__canvases) {
        delete (window as any).__canvases[options.id];
      }
    };
  }, [canvasInitialized, options.id]);
  // Tách biệt hàm vẽ cây để tránh tạo lại hàm này mỗi lần re-render
  const drawTree = useCallback(
    async (canvas: fabric.Canvas) => {
      // Kiểm tra nếu đang vẽ thì không vẽ lại
      if (isDrawingRef.current) return;
      isDrawingRef.current = true;

      // Xóa tất cả đối tượng hiện có trên canvas
      canvas.clear();

      const drawNode = async (
        node: Node,
        parentNode?: Node,
        parentRelation?: Relation
      ) => {
        const canvasCenter = canvas.getCenter();

        if (parentNode) {
          node.parent = parentNode;
          node.parentRelation = parentRelation;
        }

        const nodeObject = await createNode(node.name, node.image, node);

        nodeObject.on("mousedown", () => {
          highlightManagerRef.current?.handleNodeClick(node);
          node.onClick && node.onClick(node);
        });

        node._object = nodeObject;
        const relationships = node.relationships;

        let left = canvasCenter.left;
        const top =
          minimumDistanceBetweenNodes * ((node.generation as number) + 1) +
          (node.generation as number) * verticalDistanceBetweenNodes;
        nodeObject.set({ left, top });
        canvas.add(nodeObject);

        if (relationships && relationships.length > 0) {
          relationships.sort((a, b) => {
            if (!a.partner && b.partner) {
              return -1;
            } else if (a.partner && !b.partner) {
              return 1;
            } else if (a.isMarried && !b.isMarried) {
              return -1;
            } else if (!a.isMarried && b.isMarried) {
              return 1;
            } else {
              return 0;
            }
          });

          let foundPartnerRelationship = false;

          relationships.forEach((relationship) => {
            if (!relationship.partner && relationship.children?.length > 0) {
              relationship.isPrimaryRelationship = true;
            } else if (relationship.partner && !foundPartnerRelationship) {
              relationship.isPrimaryRelationship = true;
              foundPartnerRelationship = true;
            } else {
              relationship.isPrimaryRelationship = false;
            }
          });

          for (const relationship of node.relationships) {
            if (relationship.partner) {
              const partnerNode = await createNode(
                relationship.partner.name,
                relationship.partner.image,
                relationship.partner
              );

              if (!relationship.partner.relationships) {
                relationship.partner.relationships = [];
              }
              relationship.partner.parent = node;
              relationship.partner.parentRelation = relationship;

              partnerNode.on("mousedown", () => {
                highlightManagerRef.current?.handleNodeClick(
                  relationship.partner as Node
                );
                relationship.partner?.onClick &&
                  relationship.partner.onClick(relationship.partner);
              });

              relationship.partner._object = partnerNode;
              partnerNode.set({ left, top });
              canvas.add(partnerNode);
            }

            if (relationship.children && relationship.children.length > 0) {
              for (const child of relationship.children) {
                await drawNode(child, node, relationship);
              }
            }
          }
        }
      };

      const drawPartnerRelations = (node: Node) => {
        const relationships = node.relationships;
        if (relationships && relationships.length > 0) {
          for (let i = 0; i < relationships.length; i++) {
            const relationship = relationships[i];

            if (relationship.partner) {
              relationship._relation = drawPartnerLine(
                node._object as fabric.Group,
                relationship.partner._object as fabric.Group,
                relationship.isMarried as boolean,
                relationship.isPrimaryRelationship === true
              );
              canvas.add(relationship._relation);
            }
            if (relationship.children && relationship.children.length > 0) {
              for (const child of relationship.children) {
                drawPartnerRelations(child);
              }
            }
          }
        }
      };

      const drawChildRelations = (node: Node) => {
        const relationships = node.relationships;
        if (relationships && relationships.length > 0) {
          for (let i = 0; i < relationships.length; i++) {
            const relationship = relationships[i];
            const isPrimaryRelationship =
              relationship.isPrimaryRelationship === true;

            if (relationship.children && relationship.children.length > 0) {
              relationship._parentLine = drawParentLine(
                relationship._relation ? relationship._relation : node,
                isPrimaryRelationship
              );
              canvas.add(relationship._parentLine);

              for (const child of relationship.children) {
                drawChildRelations(child);
                child._childLine = drawChildLine(
                  child as Node,
                  relationship._parentLine as fabric.Line,
                  isPrimaryRelationship
                );
                canvas.add(child._childLine);
              }
            }
          }
        }
      };

      try {
        await drawNode(root);
        positionNodes(canvas, root);
        drawPartnerRelations(root);
        drawChildRelations(root);
        highlightManagerRef.current?.fixLineOverlapping();
        bringNodesToFront(canvas);
        canvas.renderAll();
      } catch (err) {
        console.error("Lỗi khi vẽ cây:", err);
      } finally {
        isDrawingRef.current = false;
      }
    },
    [root]
  );

  // Chỉ vẽ cây khi canvas đã được khởi tạo và cây chưa được vẽ
  useEffect(() => {
    if (canvasInitialized && fabricCanvasRef.current && !isDrawingRef.current) {
      drawTree(fabricCanvasRef.current);
    }
  }, [canvasInitialized, drawTree]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas
        ref={canvasRef}
        id={options.id}
        width={options.width}
        height={options.height}
      />
    </div>
  );
};

export default React.memo(FamilyTree); // Sử dụng memo để tránh re-render không cần thiết
