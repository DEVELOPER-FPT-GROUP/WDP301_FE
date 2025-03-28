import { fabric } from "fabric";
import type { Node, Relation } from "../types/node";
import { NodeGroup } from "../components/NodeGroup";
import {
  defaultFemaleImageUrl,
  defaultImageUrl,
  defaultMaleImageUrl,
} from "../constants/defaults";
import {
  lineStyles,
  nodeRadius,
  fontSize,
  verticalDistanceBetweenNodes,
  minimumDistanceBetweenNodes,
} from "../constants/styles";

export const setImageSrc = async (
  imageObject: fabric.Image,
  imageUrl: string
): Promise<fabric.Image> => {
  return new Promise((resolve, reject) => {
    imageObject.setSrc(
      imageUrl,
      function (img: fabric.Image) {
        img.set({
          originX: "center",
          originY: "center",
        });
        if (imageObject) {
          resolve(imageObject);
        } else {
          reject("image src not set");
        }
      },
      { crossOrigin: "anonymous" }
    );
  });
};

export const createNode = async (
  text: string,
  imageUrl: string | undefined,
  node: Node
) => {
  if (!imageUrl) {
    if (node.gender === "male") {
      imageUrl = defaultMaleImageUrl;
    } else if (node.gender === "female") {
      imageUrl = defaultFemaleImageUrl;
    } else {
      imageUrl = defaultImageUrl;
    }
  }

  // Thiết lập màu sắc dựa trên giới tính
  let fillColor = "#FFFFFF";
  let strokeColor = node.gender === "female" ? "#FF9EAA" : "#A0D2EB";

  // Create text object first to calculate its dimensions
  const textObject = new fabric.Text(text, {
    fontSize: fontSize,
    originX: "center",
    originY: "center",
    fontWeight: "bold",
    fill: node.isAlive === false ? "#666666" : "#333333", // Darker text for alive, lighter for deceased
    textAlign: "center",
  });

  // Calculate dimensions
  const textWidth = textObject.width || 0;
  const textHeight = textObject.height || 0;

  // Calculate card dimensions based on text and image size
  // Ensure minimum width is at least nodeRadius * 2
  const cardWidth = Math.max(nodeRadius * 2, textWidth + 20); // 20px padding
  // Height includes nodeRadius * 2 for the image plus text height plus padding
  const cardHeight = nodeRadius * 2 + textHeight + 30; // Extra height for the name and padding

  // Create card background with calculated dimensions
  const cardBackground = new fabric.Rect({
    width: cardWidth,
    height: cardHeight,
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: 3,
    rx: 8, // Rounded corners
    ry: 8, // Rounded corners
    originX: "center",
    originY: "center",
    shadow: new fabric.Shadow({
      color: "rgba(0,0,0,0.3)",
      blur: 5,
      offsetX: 0,
      offsetY: 2,
    }),
  });

  // Create image
  let imageObject = new fabric.Image(imageUrl, {
    lockScalingFlip: true,
    crossOrigin: "Anonymous",
  });

  imageObject = await setImageSrc(imageObject, imageUrl);
  imageObject.scale((nodeRadius * 1.8) / (imageObject.width as number));

  // Position the image near the top of the card
  imageObject.set({
    top: -cardHeight / 2 + nodeRadius,
    originX: "center",
    originY: "center",
  });

  // Apply grayscale to the image if the person is deceased
  if (node.isAlive === false) {
    // Apply grayscale filter to the image
    imageObject.filters?.push(new fabric.Image.filters.Grayscale());
    imageObject.applyFilters();
  }

  // Clip image to circle
  const clipPath = new fabric.Circle({
    radius: nodeRadius * 0.9,
    originX: "center",
    originY: "center",
    // Image scaling is applied to the clip path, so we need to invert it
    scaleX: 1 / (imageObject.scaleX as number),
    scaleY: 1 / (imageObject.scaleY as number),
  });

  imageObject.set({
    clipPath: clipPath,
  });

  // Update text width and position
  textObject.set({
    width: cardWidth - 10, // Make text fit within card width with some margin
    top: cardHeight / 2 - textHeight / 2 - 10, // Position near bottom of card, adjusted for text height
  });

  // Create the node group
  const group = new NodeGroup([cardBackground, imageObject, textObject], {
    originX: "center",
    originY: "center",
    selectable: false,
    isNode: true,
    nodeData: node,
    hoverCursor: "pointer",
  });

  // Set lower opacity for the entire card if the person is deceased
  if (node.isAlive === false) {
    group.set({ opacity: 0.7 });
  }

  return group;
};

export const drawPartnerLine = (
  node1: fabric.Group,
  node2: fabric.Group,
  isMarried: boolean,
  isPrimaryRelationship: boolean = true
) => {
  const node1Center = node1.getCenterPoint();
  const node2Center = node2.getCenterPoint();
  const line = new fabric.Line(
    [
      node1Center.x + nodeRadius,
      node1Center.y - nodeRadius / 2,
      node2Center.x - nodeRadius,
      node2Center.y - nodeRadius / 2,
    ],
    {
      ...lineStyles,
      strokeDashArray: isMarried && isPrimaryRelationship ? [] : [5, 5],
    }
  );
  return line;
};

export const drawParentLine = (
  parent: fabric.Line | Node,
  isPrimaryRelationship: boolean = true
) => {
  let parentLineOrigin: fabric.Point;
  if (parent instanceof fabric.Line) {
    parentLineOrigin = parent.getCenterPoint();
    if (!isPrimaryRelationship) {
      parentLineOrigin = parentLineOrigin.add(
        new fabric.Point(
          ((parent.x2 as number) - (parent.x1 as number)) / 2 - nodeRadius,
          0
        )
      );
    }
  } else {
    parentLineOrigin = parent._object?.getCenterPoint() as fabric.Point;
  }
  const line = new fabric.Line(
    [
      parentLineOrigin.x,
      parentLineOrigin.y,
      parentLineOrigin.x,
      parentLineOrigin.y + verticalDistanceBetweenNodes,
    ],
    {
      ...lineStyles,
      strokeDashArray:
        parent instanceof fabric.Line && isPrimaryRelationship ? [] : [5, 5],
    }
  );
  return line;
};

export const drawChildLine = (
  child: Node,
  parentLine: fabric.Line,
  isPrimaryRelationship: boolean = true
) => {
  const childObject = child._object as fabric.Group;
  const childCenter = childObject.getCenterPoint();
  const strokeWidth = parentLine.strokeWidth ? parentLine.strokeWidth : 0;

  // Use line style based on relationship
  const lineStyle = {
    ...lineStyles,
    strokeDashArray: isPrimaryRelationship ? [] : [5, 5],
  };

  const horizontalLine = new fabric.Line(
    [
      (parentLine.x2 as number) +
        ((parentLine.x2 as number) > childCenter.x ? strokeWidth : 0),
      parentLine.y2 as number,
      childCenter.x,
      parentLine.y2 as number,
    ],
    lineStyle
  );

  const verticalLine = new fabric.Line(
    [
      horizontalLine.x2 as number,
      horizontalLine.y2 as number,
      childCenter.x,
      childCenter.y - (nodeRadius * 2 + 40) / 2, // Adjusted to account for card height
    ],
    lineStyle
  );

  return new fabric.Group([horizontalLine, verticalLine], {
    selectable: false,
  });
};

export const groupNodes = (generations: [fabric.Group][], node: Node) => {
  if (generations[node.generation as number]) {
    generations[node.generation as number].push(node._object as fabric.Group);
  } else {
    generations[node.generation as number] = [node._object as fabric.Group];
  }
  node.relationships &&
    generations[node.generation as number].push(
      ...node.relationships
        .map(
          (relationship: Relation) =>
            relationship.partner?._object as fabric.Group
        )
        .filter(Boolean)
    );
  node.relationships &&
    node.relationships.forEach((relationship: Relation) => {
      relationship.children &&
        relationship.children.forEach((child: Node) => {
          groupNodes(generations, child);
        });
    });
};

export const positionNodes = (canvas: fabric.Canvas, root: Node) => {
  let generations: [fabric.Group][] = [];
  groupNodes(generations, root);
  const canvasCenter = canvas.getCenter();

  generations.forEach((generation: fabric.Group[]) => {
    // Remove undefined elements
    const filteredGeneration = generation.filter((node) => node);

    if (filteredGeneration.length === 0) return;

    const generationWidth =
      filteredGeneration.length *
        filteredGeneration[0].getBoundingRect().width +
      (filteredGeneration.length - 1) * minimumDistanceBetweenNodes;
    let left = canvasCenter.left - generationWidth / 2;

    filteredGeneration.forEach((node: fabric.Group) => {
      node && node.set({ left });
      left +=
        (node ? node.getBoundingRect().width : 0) + minimumDistanceBetweenNodes;
    });
  });
};

export const bringNodesToFront = (canvas: fabric.Canvas) => {
  // First, send all non-node objects to the back
  canvas.getObjects().forEach((object: fabric.Object) => {
    if (!(object instanceof NodeGroup)) {
      object.sendToBack();
    }
  });

  // Then explicitly bring nodes to the front
  canvas.getObjects().forEach((object: fabric.Object) => {
    if (object instanceof NodeGroup) {
      object.bringToFront();
    }
  });
};
