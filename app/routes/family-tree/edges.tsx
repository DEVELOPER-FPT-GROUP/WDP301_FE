export const initialEdges = [
  // Thế hệ 1: Kết nối ông bà cố với nhau
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "smoothstep",
    animated: true,
    handleSource: "source-right-1",
    handleTarget: "target-left-2",
  },

  // Thế hệ 2: Kết nối ông bà cố với con cái
  {
    id: "e1-3",
    source: "1",
    target: "3",
    type: "smoothstep",
    handleSource: "source-bottom-1",
    handleTarget: "target-top-3",
  },
  {
    id: "e1-5",
    source: "1",
    target: "5",
    type: "smoothstep",
    handleSource: "source-bottom-1",
    handleTarget: "target-top-5",
  },

  // Thế hệ 2: Kết nối ông bà nội với nhau
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: "smoothstep",
    animated: true,
    handleSource: "source-right-3",
    handleTarget: "target-left-4",
  },

  // Thế hệ 3: Kết nối ông bà nội/ngoại với con cái
  {
    id: "e3-7",
    source: "3",
    target: "7",
    type: "smoothstep",
    handleSource: "source-bottom-3",
    handleTarget: "target-top-7",
  },
  {
    id: "e3-9",
    source: "3",
    target: "9",
    type: "smoothstep",
    handleSource: "source-bottom-3",
    handleTarget: "target-top-9",
  },

  // Thế hệ 3: Kết nối cha mẹ với nhau
  {
    id: "e7-7",
    source: "7",
    target: "6",
    type: "smoothstep",
    animated: true,
    handleSource: "source-right-6",
    handleTarget: "target-left-7",
  },
  {
    id: "e9-8",
    source: "9",
    target: "8",
    type: "smoothstep",
    animated: true,
    handleSource: "source-right-9",
    handleTarget: "target-left-8",
  },

  // Thế hệ 4: Kết nối cha mẹ với con cái
  {
    id: "e7-13",
    source: "7",
    target: "13",
    type: "smoothstep",
    handleSource: "source-bottom-7",
    handleTarget: "target-top-13",
  },
  {
    id: "e7-14",
    source: "7",
    target: "14",
    type: "smoothstep",
    handleSource: "source-bottom-7",
    handleTarget: "target-top-14",
  },
  {
    id: "e7-15",
    source: "7",
    target: "15",
    type: "smoothstep",
    handleSource: "source-bottom-7",
    handleTarget: "target-top-15",
  },
  {
    id: "e9-12",
    source: "9",
    target: "12",
    type: "smoothstep",
    handleSource: "source-bottom-9",
    handleTarget: "target-top-12",
  },

  // Thế hệ 4: Kết nối vợ chồng
  {
    id: "e13-10",
    source: "13",
    target: "10",
    type: "smoothstep",
    animated: true,
    handleSource: "source-right-13",
    handleTarget: "target-left-10",
  },
  {
    id: "e12-11",
    source: "12",
    target: "11",
    type: "smoothstep",
    animated: true,
    handleSource: "source-right-12",
    handleTarget: "target-left-11",
  },

  // Thế hệ 5: Kết nối cha mẹ với con cái
  {
    id: "e13-16",
    source: "13",
    target: "16",
    type: "smoothstep",
    handleSource: "source-bottom-13",
    handleTarget: "target-top-16",
  },
  {
    id: "e13-19",
    source: "13",
    target: "19",
    type: "smoothstep",
    handleSource: "source-bottom-13",
    handleTarget: "target-top-19",
  },
  {
    id: "e13-20",
    source: "13",
    target: "20",
    type: "smoothstep",
    handleSource: "source-bottom-13",
    handleTarget: "target-top-20",
  },
  {
    id: "e12-17",
    source: "12",
    target: "17",
    type: "smoothstep",
    handleSource: "source-bottom-12",
    handleTarget: "target-top-17",
  },
  {
    id: "e12-18",
    source: "12",
    target: "18",
    type: "smoothstep",
    handleSource: "source-bottom-12",
    handleTarget: "target-top-18",
  },
];
