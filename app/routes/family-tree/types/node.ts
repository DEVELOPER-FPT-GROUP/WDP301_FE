import { fabric } from "fabric";

export interface Node {
  id: string | number;
  name: string;
  image?: string;
  gender: "female" | "male";
  generation?: number;
  relationships: Relation[];
  isAlive: boolean;
  dateOfBirth?: string; // Ngày sinh
  dateOfDeath?: string; // Ngày mất
  onClick?: (node: Node) => void;
  _object?: fabric.Group;
  _childLine: fabric.Group;
  parent?: Node;
  parentRelation?: Relation;
}

export interface Relation {
  partner: Node | undefined;
  isMarried: boolean | undefined;
  children: Node[];
  _relation?: fabric.Line;
  _parentLine?: fabric.Line;
  isPrimaryRelationship?: boolean;
}
