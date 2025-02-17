import type { Node } from "@xyflow/react";

// Định nghĩa kiểu dữ liệu cho FamilyMemberData với điều kiện gender
export interface BaseFamilyMemberData {
  name: string;
  generation: number;
  gender: "male" | "female";
  age: number;
  birthDate?: string;
  parentId?: { fatherId: string; motherId: string } | null;
  childId?: string[];

  [key: string]: unknown; // Đảm bảo có thể thêm các thuộc tính khác
}

// Định nghĩa kiểu cho male với wifeId
export interface MaleFamilyMemberData extends BaseFamilyMemberData {
  gender: "male";
  wifeId: string | null; // Chỉ cần có wifeId khi gender là male
}

// Định nghĩa kiểu cho female với husbandId
export interface FemaleFamilyMemberData extends BaseFamilyMemberData {
  gender: "female";
  husbandId: string | null; // Chỉ cần có husbandId khi gender là female
}

// Kết hợp Male và Female để có kiểu dữ liệu chung cho FamilyMemberData
export type FamilyMemberData = MaleFamilyMemberData | FemaleFamilyMemberData;

// Định nghĩa kiểu node trong React Flow
export type FamilyMemberNodeType = Node<FamilyMemberData>;
