export const initialEdges = [
  // Thế hệ 1: Kết nối ông bà cố
  { id: "e1-2", source: "1", target: "2", type: "smoothstep" },

  // Thế hệ 2: Kết nối ông bà cố với con cái
  { id: "e1-3", source: "1", target: "3", type: "smoothstep" },
  { id: "e1-5", source: "1", target: "5", type: "smoothstep" },

  // Thế hệ 2: Kết nối ông bà nội với nhau
  { id: "e3-4", source: "3", target: "4", type: "smoothstep" },

  // Thế hệ 3: Kết nối ông bà nội/ngoại với con cái
  { id: "e3-7", source: "3", target: "7", type: "smoothstep" },
  { id: "e3-9", source: "3", target: "9", type: "smoothstep" },

  // Thế hệ 3: Kết nối cha mẹ với nhau
  { id: "e6-7", source: "6", target: "7", type: "smoothstep" },
  { id: "e8-9", source: "8", target: "9", type: "smoothstep" },

  // Thế hệ 4: Kết nối cha mẹ với con cái
  { id: "e6-13", source: "6", target: "13", type: "smoothstep" },
  { id: "e6-15", source: "6", target: "15", type: "smoothstep" },
  { id: "e8-12", source: "8", target: "12", type: "smoothstep" },

  // Thế hệ 4: Kết nối vợ chồng
  { id: "e10-13", source: "10", target: "13", type: "smoothstep" },
  { id: "e12-11", source: "12", target: "11", type: "smoothstep" },

  // Thế hệ 5: Kết nối cha mẹ với con cái
  { id: "e10-16", source: "10", target: "16", type: "smoothstep" },
  { id: "e10-19", source: "10", target: "19", type: "smoothstep" },
  { id: "e10-20", source: "10", target: "20", type: "smoothstep" },
  { id: "e12-17", source: "12", target: "17", type: "smoothstep" },
  { id: "e12-18", source: "12", target: "18", type: "smoothstep" },
];
