import { useEffect, useRef, useState, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  MarkerClusterer,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import styles from "./MapComponent.module.css";

const MapComponent = ({ shrineData, onSelectShrine, selectedShrine }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["marker"],
  });

  const [map, setMap] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    const fetchShrineData = async () => {
      try {
        const response = await fetch("/export.geojson");
        const text = await response.text();

        // 디버깅을 위한 로그
        console.log("Raw GeoJSON text:", text.substring(0, 200)); // 처음 200자만 출력

        let data;
        try {
          data = JSON.parse(text);
          console.log("Parsed data structure:", {
            type: data.type,
            featureCount: data.features?.length,
            sampleFeature: data.features?.[0],
          });
        } catch (e) {
          console.error("JSON parsing error:", e);
          return;
        }

        // 데이터 유효성 검사
        if (!data || !data.features || !Array.isArray(data.features)) {
          console.error("Invalid GeoJSON structure");
          return;
        }

        // 데이터 처리
        const processed = data.features
          .map((feature) => {
            // 이름이 없는 데이터는 제외
            if (!feature.properties.name) {
              return null;
            }

            if (!feature.geometry || !feature.geometry.coordinates) {
              console.log("Feature missing geometry or coordinates:", feature);
              return null;
            }

            let center;
            try {
              if (feature.geometry.type === "Point") {
                center = [
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0],
                ];
              } else if (feature.geometry.type === "Polygon") {
                const coords = feature.geometry.coordinates[0];
                const sumLat = coords.reduce((sum, coord) => sum + coord[1], 0);
                const sumLng = coords.reduce((sum, coord) => sum + coord[0], 0);
                center = [sumLat / coords.length, sumLng / coords.length];
              } else if (feature.geometry.type === "MultiPolygon") {
                const coords = feature.geometry.coordinates[0][0];
                const sumLat = coords.reduce((sum, coord) => sum + coord[1], 0);
                const sumLng = coords.reduce((sum, coord) => sum + coord[0], 0);
                center = [sumLat / coords.length, sumLng / coords.length];
              }

              if (!center) {
                return null;
              }

              return {
                ...feature,
                center,
              };
            } catch (e) {
              console.error("Error processing feature:", e);
              return null;
            }
          })
          .filter(Boolean);

        console.log("Processed data count:", processed.length);
        console.log("Sample processed feature:", processed[0]);

        setProcessedData(processed);
      } catch (error) {
        console.error("Failed to fetch shrine data:", error);
        setProcessedData([]);
      }
    };

    fetchShrineData();
  }, []);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // 지도 중심 계산
  const getMapBounds = useCallback(() => {
    if (!processedData.length) return null;

    const bounds = new window.google.maps.LatLngBounds();
    processedData.forEach((shrine) => {
      if (shrine.center) {
        const [lat, lng] = shrine.center;
        bounds.extend({ lat, lng });
      }
    });
    return bounds;
  }, [processedData]);

  // 마커 클릭 핸들러
  const handleMarkerClick = useCallback(
    (shrine) => {
      setSelectedMarker(shrine);
      onSelectShrine(shrine);
    },
    [onSelectShrine]
  );

  useEffect(() => {
    if (map && processedData.length) {
      const bounds = getMapBounds();
      if (bounds) {
        map.fitBounds(bounds);
      }
    }
  }, [map, processedData, getMapBounds]);

  if (!isLoaded) {
    return <div className={styles.loading}>지도를 불러오는 중...</div>;
  }

  return (
    <div className={styles.map}>
      <GoogleMap
        mapContainerClassName={styles.mapContainer}
        center={{ lat: 35.6762, lng: 139.6503 }}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <MarkerClusterer
          options={{
            imagePath:
              "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
            maxZoom: 15,
            minimumClusterSize: 2,
            gridSize: 50,
          }}
        >
          {(clusterer) => (
            <>
              {processedData.map((shrine, index) => {
                if (!shrine.center) {
                  console.log("Shrine missing center:", shrine);
                  return null;
                }
                const [lat, lng] = shrine.center;

                console.log("Rendering marker at:", { lat, lng });

                return (
                  <Marker
                    key={index}
                    position={{ lat, lng }}
                    onClick={() => handleMarkerClick(shrine)}
                    clusterer={clusterer}
                  />
                );
              })}
            </>
          )}
        </MarkerClusterer>

        {selectedMarker && (
          <InfoWindow
            position={{
              lat: selectedMarker.center[0],
              lng: selectedMarker.center[1],
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className={styles.popup}>
              <h3 className={styles.popupTitle}>
                {selectedMarker.properties.name}
              </h3>
              {selectedMarker.properties["name:en"] && (
                <p className={styles.popupSubtitle}>
                  {selectedMarker.properties["name:en"]}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapComponent;
