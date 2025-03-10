export default function handler(req, res) {
  // 임시 데이터 예시
  const shrineData = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: "1",
          name: "明治神宮",
          address: "東京都渋谷区代々木神園町1-1",
          type: "神社",
          founded: "1920",
        },
        geometry: {
          type: "Point",
          coordinates: [139.6999, 35.6764],
        },
      },
      // 더 많은 신사 데이터 추가 가능
    ],
  };

  res.status(200).json(shrineData);
}
