import type { Node } from "@xyflow/react";
import type { BaseFamilyMemberData } from "./types";

// Hằng số
const NODE_WIDTH = 180;
const SIBLING_SEPARATION = 250;
const LEVEL_SEPARATION = 300;
const SPOUSE_SEPARATION = 200;

/**
 * Hàm chính để tính toán vị trí các node
 */
function calculatePositions(data: Node<BaseFamilyMemberData>[]) {
  // Map để truy cập nhanh node theo ID
  const nodeMap: Record<string, Node<BaseFamilyMemberData>> = {};
  data.forEach((node) => {
    nodeMap[node.id] = node;
  });

  // Tạo hai mảng: mainNodes (cây chính) và remainingNodes (vợ/chồng)
  const mainNodes: Node<BaseFamilyMemberData>[] = [];
  const remainingNodes: Node<BaseFamilyMemberData>[] = [];

  // Tìm node gốc (thế hệ 0, có wifeId)
  const rootNode = data.find(
    (node) =>
      node.data.generation === 0 && node.data.spouse && node.data.spouse.wifeId
  );

  if (!rootNode) {
    console.warn("Không tìm thấy node gốc (generation 0 với wifeId)");
    return {};
  }

  // Xây dựng cây chính từ root, theo thứ tự childId
  buildMainTree(rootNode, mainNodes, nodeMap);

  // Các node còn lại sẽ là các node vợ/chồng
  data.forEach((node) => {
    if (!mainNodes.some((n) => n.id === node.id)) {
      remainingNodes.push(node);
    }
  });

  // Áp dụng thuật toán Reingold-Tilford cải tiến
  const treeStructure = buildTreeStructure(mainNodes);
  const positions = applyReingoldTilford(treeStructure);

  // Xử lý vị trí cho các node vợ/chồng
  positionSpouses(positions, mainNodes, remainingNodes);

  // Điều chỉnh sau khi tính toán để đảm bảo thứ tự đúng trong cùng một thế hệ
  fixSameGenerationOrdering(positions, mainNodes, nodeMap);

  return positions;
}

/**
 * Điều chỉnh vị trí để đảm bảo thứ tự đúng giữa các node cùng thế hệ
 * Giải quyết vấn đề khi con của node đầu tiên có x lớn hơn node thứ hai cùng thế hệ với cha nó
 */
function fixSameGenerationOrdering(
  positions: Record<string, { x: number; y: number }>,
  mainNodes: Node<BaseFamilyMemberData>[],
  nodeMap: Record<string, Node<BaseFamilyMemberData>>
) {
  // Nhóm các node theo thế hệ
  const nodesByGeneration: Record<number, Node<BaseFamilyMemberData>[]> = {};

  mainNodes.forEach((node) => {
    const gen = node.data.generation;
    if (!nodesByGeneration[gen]) {
      nodesByGeneration[gen] = [];
    }
    nodesByGeneration[gen].push(node);
  });

  // Sắp xếp các node trong mỗi thế hệ theo vị trí x
  Object.keys(nodesByGeneration).forEach((genStr) => {
    const gen = parseInt(genStr);
    nodesByGeneration[gen].sort((a, b) => {
      return positions[a.id].x - positions[b.id].x;
    });
  });

  // Duyệt qua thế hệ theo thứ tự từ thấp đến cao (từ thế hệ gốc đi xuống)
  const generations = Object.keys(nodesByGeneration)
    .map(Number)
    .sort((a, b) => a - b);

  for (let i = 0; i < generations.length - 1; i++) {
    const currentGen = generations[i];
    const nextGen = generations[i + 1];
    const currentGenNodes = nodesByGeneration[currentGen];
    const nextGenNodes = nodesByGeneration[nextGen];

    // Kiểm tra mỗi cặp node liên tiếp trên cùng thế hệ
    for (let j = 0; j < currentGenNodes.length - 1; j++) {
      const leftNode = currentGenNodes[j];
      const rightNode = currentGenNodes[j + 1];

      // Tìm tất cả con của leftNode
      const leftNodeChildren = leftNode.data.children || [];

      if (leftNodeChildren.length > 0) {
        // Tìm x lớn nhất trong số các con của leftNode
        let maxChildX = -Infinity;
        leftNodeChildren.forEach((childId) => {
          if (positions[childId] && positions[childId].x > maxChildX) {
            maxChildX = positions[childId].x;
          }
        });

        // Nếu con xa nhất bên phải của leftNode vượt quá rightNode
        if (maxChildX >= positions[rightNode.id].x) {
          // Tính khoảng cách cần dịch chuyển
          const shift =
            maxChildX - positions[rightNode.id].x + SIBLING_SEPARATION;

          // Dịch chuyển rightNode và tất cả node cùng thế hệ phía bên phải nó
          for (let k = j + 1; k < currentGenNodes.length; k++) {
            const nodeToShift = currentGenNodes[k];
            positions[nodeToShift.id].x += shift;

            // Dịch chuyển cả toàn bộ cây con của node này
            shiftSubtree(nodeToShift.id, shift, positions, nodeMap);
          }
        }
      }
    }
  }
}

/**
 * Dịch chuyển toàn bộ cây con của một node
 */
function shiftSubtree(
  nodeId: string,
  shift: number,
  positions: Record<string, { x: number; y: number }>,
  nodeMap: Record<string, Node<BaseFamilyMemberData>>
) {
  const node = nodeMap[nodeId];
  if (!node) return;

  // Dịch chuyển vợ/chồng nếu có
  if (node.data.spouse) {
    const spouseId = node.data.spouse.wifeId || node.data.spouse.husbandId;
    if (spouseId && positions[spouseId]) {
      positions[spouseId].x += shift;
    }
  }

  // Dịch chuyển tất cả các con
  if (node.data.children) {
    node.data.children.forEach((childId) => {
      if (positions[childId]) {
        positions[childId].x += shift;
        shiftSubtree(childId, shift, positions, nodeMap);
      }
    });
  }
}

/**
 * Xây dựng cây chính dựa trên mối quan hệ cha-con
 */
function buildMainTree(
  node: Node<BaseFamilyMemberData>,
  mainNodes: Node<BaseFamilyMemberData>[],
  nodeMap: Record<string, Node<BaseFamilyMemberData>>
) {
  // Thêm node hiện tại vào mảng mainNodes nếu chưa tồn tại
  if (!mainNodes.some((n) => n.id === node.id)) {
    mainNodes.push(node);
  }

  // Nếu node có con, xử lý tiếp các con
  if (node.data.children && node.data.children.length > 0) {
    node.data.children.forEach((childId) => {
      const childNode = nodeMap[childId];
      if (childNode) {
        buildMainTree(childNode, mainNodes, nodeMap);
      }
    });
  }
}

// Cấu trúc node cho thuật toán RT
interface RTNode {
  id: string;
  generation: number;
  children: RTNode[];
  parent?: RTNode;
  x: number;
  mod: number;
  width: number;
  prelim: number;
  shift: number;
  change: number;
  thread?: RTNode;
  ancestor: RTNode;
}

/**
 * Xây dựng cấu trúc cây cho thuật toán RT
 */
function buildTreeStructure(nodes: Node<BaseFamilyMemberData>[]) {
  // Map để truy cập nhanh RT node
  const rtNodeMap: Record<string, RTNode> = {};

  // Tạo các RT node
  nodes.forEach((node) => {
    rtNodeMap[node.id] = {
      id: node.id,
      generation: node.data.generation,
      children: [],
      x: 0,
      mod: 0,
      width: NODE_WIDTH,
      prelim: 0,
      shift: 0,
      change: 0,
      ancestor: null as unknown as RTNode,
    };
  });

  // Thiết lập mối quan hệ cha-con
  nodes.forEach((node) => {
    const rtNode = rtNodeMap[node.id];
    rtNode.ancestor = rtNode; // Ban đầu, ancestor là chính nó

    if (node.data.children) {
      node.data.children.forEach((childId) => {
        const childRTNode = rtNodeMap[childId];
        if (childRTNode) {
          rtNode.children.push(childRTNode);
          childRTNode.parent = rtNode;
        }
      });
    }
  });

  // Tìm và trả về các node gốc
  return Object.values(rtNodeMap).filter((node) => !node.parent);
}

/**
 * Áp dụng thuật toán Reingold-Tilford
 */
function applyReingoldTilford(roots: RTNode[]) {
  const positions: Record<string, { x: number; y: number }> = {};
  let xOffset = 0;

  roots.forEach((root) => {
    // Bước 1: Tính vị trí sơ bộ
    firstWalk(root);

    // Bước 2: Tính vị trí cuối cùng
    secondWalk(root, -root.prelim + xOffset, 0);

    // Cập nhật offset cho cây tiếp theo
    const maxX = getMaxX(positions);
    xOffset = maxX + 500;
  });

  return positions;

  // Lượt đầu tiên - tính toán vị trí sơ bộ
  function firstWalk(node: RTNode) {
    if (node.children.length === 0) {
      // Nếu là node lá
      const leftSibling = getLeftSibling(node);
      if (leftSibling) {
        node.prelim =
          leftSibling.prelim + leftSibling.width + SIBLING_SEPARATION;
      } else {
        node.prelim = 0;
      }
    } else {
      let defaultAncestor = node.children[0];

      // Xử lý các con từ trái sang phải
      node.children.forEach((child, i) => {
        firstWalk(child);
        defaultAncestor = apportion(child, defaultAncestor, i);
      });

      // Thực hiện các thay đổi sau khi xử lý tất cả con
      executeShifts(node);

      // Tính vị trí giữa của con đầu và con cuối
      const firstChild = node.children[0];
      const lastChild = node.children[node.children.length - 1];
      const midpoint = (firstChild.prelim + lastChild.prelim) / 2;

      const leftSibling = getLeftSibling(node);
      if (leftSibling) {
        node.prelim =
          leftSibling.prelim + leftSibling.width + SIBLING_SEPARATION;
        node.mod = node.prelim - midpoint;
      } else {
        node.prelim = midpoint;
      }
    }
  }

  // Xử lý chồng chéo giữa các cây con
  function apportion(node: RTNode, ancestor: RTNode, index: number): RTNode {
    const leftSibling = getLeftSibling(node);
    if (!leftSibling) return ancestor;

    // Con trỏ cho "inside" và "outside" traversal
    let vip: RTNode = node; // "inside" con bên phải
    let vop: RTNode = node; // "outside" con bên phải
    let vim: RTNode = leftSibling; // "inside" con bên trái
    let vom: RTNode | null = getLeftmostSibling(vip); // "outside" con bên trái

    if (!vom) return ancestor; // Thêm kiểm tra null

    let sip = vip.mod; // Inside right modifier
    let sop = vop.mod; // Outside right modifier
    let sim = vim.mod; // Inside left modifier
    let som = vom.mod; // Outside left modifier

    // Tiếp tục so sánh contours cho đến khi không còn con cháu
    let nextRightVim: RTNode | null;
    let nextLeftVip: RTNode | null;

    while (
      (nextRightVim = nextRight(vim)) !== null &&
      (nextLeftVip = nextLeft(vip)) !== null
    ) {
      vim = nextRightVim;
      vip = nextLeftVip;

      const nextLeftVom = nextLeft(vom);
      if (!nextLeftVom) break;
      vom = nextLeftVom;

      const nextRightVop = nextRight(vop);
      if (!nextRightVop) break;
      vop = nextRightVop;

      vop.ancestor = node;

      // Tính khoảng cách cần dịch chuyển
      const shift =
        vim.prelim + sim - (vip.prelim + sip) + vim.width + SIBLING_SEPARATION;

      if (shift > 0) {
        // Sửa lỗi TypeScript: Kiểm tra ancestor trước khi sử dụng
        moveSubtree(node, node, shift);
        sip += shift;
        sop += shift;
      }

      // Cập nhật modifiers
      sim += vim.mod;
      sip += vip.mod;
      som += vom?.mod || 0;
      sop += vop?.mod || 0;

      // Cập nhật con trỏ
      nextRightVim = nextRight(vim);
      nextLeftVip = nextLeft(vip);
    }

    // Xử lý trường hợp không đối xứng
    if ((nextRightVim = nextRight(vim)) !== null && !nextRight(vop)) {
      vop.thread = nextRightVim;
      vop.mod += sim - sop;
    }

    if ((nextLeftVip = nextLeft(vip)) !== null && !nextLeft(vom)) {
      vom.thread = nextLeftVip;
      vom.mod += sip - som;
      return node;
    }

    return ancestor;
  }

  // Di chuyển cây con để tránh chồng chéo - Đã sửa để tránh lỗi TypeScript
  function moveSubtree(wm: RTNode, wp: RTNode, shift: number) {
    // Đảm bảo ancestor đã được xác định cho cả wm và wp
    const wmIndex = wp.children.findIndex(
      (child) => child === wm || child === wm.ancestor
    );
    const wpIndex = wp.children.findIndex((child) => child === wp.ancestor);

    // Kiểm tra tình huống lỗi
    if (wmIndex === -1 || wpIndex === -1) {
      wp.prelim += shift;
      wp.mod += shift;
      return;
    }

    // Tính số lượng node giữa wm và wp
    const subtrees = wpIndex - wmIndex;
    if (subtrees <= 0) {
      wp.prelim += shift;
      wp.mod += shift;
      return;
    }

    wp.change -= shift / subtrees;
    wp.shift += shift;
    wm.change += shift / subtrees;
    wp.prelim += shift;
    wp.mod += shift;
  }

  // Thực hiện các thay đổi tích lũy
  function executeShifts(node: RTNode) {
    let shift = 0;
    let change = 0;

    // Áp dụng các thay đổi từ phải sang trái
    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      child.prelim += shift;
      child.mod += shift;
      change += child.change;
      shift += child.shift + change;
    }
  }

  // Lượt thứ hai - tính toán vị trí cuối cùng
  function secondWalk(node: RTNode, m: number, depth: number) {
    // Tính vị trí cuối cùng
    const x = node.prelim + m;
    const y = depth * LEVEL_SEPARATION;

    // Lưu vị trí
    positions[node.id] = { x, y };

    // Cập nhật các con
    node.children.forEach((child) => {
      secondWalk(child, m + node.mod, depth + 1);
    });
  }

  // Tiện ích - lấy anh/em bên trái
  function getLeftSibling(node: RTNode): RTNode | null {
    if (node.parent) {
      const index = node.parent.children.indexOf(node);
      if (index > 0) {
        return node.parent.children[index - 1];
      }
    }
    return null;
  }

  // Tiện ích - lấy node con ngoài cùng bên trái
  function getLeftmostSibling(node: RTNode): RTNode | null {
    if (!node.parent) return null;
    return node.parent.children[0];
  }

  // Tiện ích - lấy node con tiếp theo bên phải
  function nextRight(node: RTNode): RTNode | null {
    if (node.children.length > 0) {
      return node.children[node.children.length - 1];
    }
    return node.thread || null;
  }

  // Tiện ích - lấy node con tiếp theo bên trái
  function nextLeft(node: RTNode): RTNode | null {
    if (node.children.length > 0) {
      return node.children[0];
    }
    return node.thread || null;
  }

  // Tìm giá trị X lớn nhất trong positions
  function getMaxX(positions: Record<string, { x: number; y: number }>) {
    let max = 0;
    Object.values(positions).forEach((pos) => {
      max = Math.max(max, pos.x);
    });
    return max;
  }
}

/**
 * Định vị các node vợ/chồng bên cạnh node trong cây chính
 */
function positionSpouses(
  positions: Record<string, { x: number; y: number }>,
  mainNodes: Node<BaseFamilyMemberData>[],
  remainingNodes: Node<BaseFamilyMemberData>[]
) {
  mainNodes.forEach((node) => {
    if (node.data.spouse) {
      const spouseId = node.data.spouse.wifeId || node.data.spouse.husbandId;

      if (spouseId) {
        const spouseNode = remainingNodes.find((n) => n.id === spouseId);

        if (spouseNode && positions[node.id]) {
          // Đặt vợ/chồng bên phải của node chính
          positions[spouseId] = {
            x: positions[node.id].x + SPOUSE_SEPARATION,
            y: positions[node.id].y,
          };
        }
      }
    }
  });
}

/**
 * Hàm chính xuất ra ngoài
 */
export function initialNodes(data: Node<BaseFamilyMemberData>[]) {
  const positions = calculatePositions(data);
  data.forEach((node) => {
    node.position = positions[node.id] || { x: 0, y: 0 };
  });
  return data;
}
