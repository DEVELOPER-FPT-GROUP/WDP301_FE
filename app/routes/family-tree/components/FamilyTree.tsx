import React, { useEffect, useRef, useState } from "react";
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

  // Initialize the canvas after component mount
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a new Fabric canvas instance
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

    return () => {
      // Clean up resources when component unmounts
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [options.id, options.width, options.height]);

  // Draw the family tree after canvas is initialized
  useEffect(() => {
    if (!canvasInitialized || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

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

    const drawTree = async () => {
      await drawNode(root);

      positionNodes(canvas, root);
      drawPartnerRelations(root);
      drawChildRelations(root);
      highlightManagerRef.current?.fixLineOverlapping();
      bringNodesToFront(canvas);
      canvas.renderAll();
    };

    drawTree();
  }, [root, options, canvasInitialized]);

  // Set dynamic styles for canvas container
  const containerStyle = {
    width: "100%",
    height: "100%",
    position: "relative" as const,
  };

  return (
    <div style={containerStyle}>
      <canvas
        ref={canvasRef}
        id={options.id}
        width={options.width}
        height={options.height}
      />
    </div>
  );
};

export default FamilyTree;
