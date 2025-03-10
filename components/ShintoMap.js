import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./ShintoMap.module.css";
import MapComponent from "./MapComponent";

// Leaflet 컴포넌트를 클라이언트 사이드에서만 로드
const MapWithNoSSR = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <div className={styles.loading}>지도를 불러오는 중...</div>,
});

const ShintoMap = () => {
  const [shrineData, setShrineData] = useState([]);
  const [selectedShrine, setSelectedShrine] = useState(null);

  useEffect(() => {
    const fetchShrineData = async () => {
      try {
        const response = await fetch("/export.geojson");
        const data = await response.json();

        // 데이터 전처리: 중심점 계산
        const processedData = data.features.map((feature) => {
          let center;
          if (feature.geometry.type === "Polygon") {
            // Polygon의 첫 번째 좌표 배열의 중심점 계산
            const coords = feature.geometry.coordinates[0];
            const sumLat = coords.reduce((sum, coord) => sum + coord[1], 0);
            const sumLng = coords.reduce((sum, coord) => sum + coord[0], 0);
            center = [sumLat / coords.length, sumLng / coords.length];
          } else if (feature.geometry.type === "MultiPolygon") {
            // MultiPolygon의 첫 번째 Polygon의 중심점 계산
            const coords = feature.geometry.coordinates[0][0];
            const sumLat = coords.reduce((sum, coord) => sum + coord[1], 0);
            const sumLng = coords.reduce((sum, coord) => sum + coord[0], 0);
            center = [sumLat / coords.length, sumLng / coords.length];
          }
          return { ...feature, center };
        });

        setShrineData(processedData);
      } catch (error) {
        console.error("신사 데이터를 불러오는데 실패했습니다:", error);
      }
    };

    fetchShrineData();
  }, []);

  const handleShrineSelect = (shrine) => {
    setSelectedShrine(shrine);
  };

  return (
    <div className={styles.container}>
      <div className={styles.mapContainer}>
        <MapComponent
          onSelectShrine={handleShrineSelect}
          selectedShrine={selectedShrine}
        />
      </div>

      <div className={styles.shrineInfo}>
        {selectedShrine ? (
          <div className={styles.shrineInfoContent}>
            <h2 className={styles.shrineTitle}>
              {selectedShrine.properties.name}
            </h2>
            {selectedShrine.properties["name:en"] && (
              <h3 className={styles.shrineSubtitle}>
                {selectedShrine.properties["name:en"]}
              </h3>
            )}
            <div className={styles.coordinates}>
              <p>위치 정보</p>
              <div className={styles.coordinateValues}>
                <span>위도: {selectedShrine.center[0].toFixed(6)}</span>
                <span>경도: {selectedShrine.center[1].toFixed(6)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noSelection}>
            <p>지도에서 신사를 선택해주세요</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShintoMap;
