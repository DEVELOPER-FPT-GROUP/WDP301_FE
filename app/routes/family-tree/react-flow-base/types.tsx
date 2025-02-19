import type { Node } from "@xyflow/react";

// Định nghĩa kiểu dữ liệu cho FamilyMemberData với điều kiện gender
export type BaseFamilyMemberData = {
  memberId: string;
  familyId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth: string;
  dateOfDeath?: string;
  placeOfBirth: string | null;
  placeOfDeath: string | null;
  isAlive: boolean;
  generation: number;
  shortSummary?: string | null;
  gender: "male" | "female";
  spouse: {
    wifeId?: string;
    husbandId?: string;
  };

  parent?: { fatherId: string; motherId: string } | null;
  children?: string[];

  [key: string]: unknown; // Đảm bảo có thể thêm các thuộc tính khác
};

// Kết hợp Male và Female để có kiểu dữ liệu chung cho FamilyMemberData

// Định nghĩa kiểu node trong React Flow
export type FamilyMemberNodeType = Node<BaseFamilyMemberData>;
