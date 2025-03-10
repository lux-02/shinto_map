import { useEffect, useState, useRef } from "react";
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
  const [placeDetails, setPlaceDetails] = useState(null);
  const mapRef = useRef(null);
  const placesService = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Places 서비스 초기화
  const initPlacesService = (map) => {
    if (
      !map ||
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places
    ) {
      console.warn("Google Maps Places API not loaded yet");
      return;
    }

    try {
      placesService.current = new window.google.maps.places.PlacesService(map);
      console.log("Places service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Places service:", error);
      setError("Places 서비스 초기화에 실패했습니다.");
    }
  };

  // 장소 상세 정보 가져오기
  const fetchPlaceDetails = async (shrine) => {
    if (!placesService.current || !window.google || !window.google.maps) {
      setError("Google Maps API가 아직 로드되지 않았습니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 먼저 장소 검색
      const findPlaceRequest = {
        query: `${shrine.properties.name} ${
          shrine.properties["addr:full"] || ""
        }`,
        fields: ["place_id", "name", "formatted_address"], // findPlaceFromQuery에서 사용 가능한 필드만 요청
      };

      return new Promise((resolve, reject) => {
        placesService.current.findPlaceFromQuery(
          findPlaceRequest,
          (results, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              results?.[0]
            ) {
              const placeId = results[0].place_id;

              // 상세 정보 요청
              const detailsRequest = {
                placeId: placeId,
                fields: [
                  "name",
                  "formatted_address",
                  "photo",
                  "rating",
                  "user_ratings_total",
                  "opening_hours",
                  "url", // 'website' 대신 'url' 사용
                  "formatted_phone_number",
                  "review",
                  "price_level",
                  "geometry",
                ],
              };

              placesService.current.getDetails(
                detailsRequest,
                (place, detailStatus) => {
                  if (
                    detailStatus ===
                    window.google.maps.places.PlacesServiceStatus.OK
                  ) {
                    // URL 필드 이름 변경
                    const processedPlace = {
                      ...place,
                      website: place.url, // url을 website로 매핑
                    };
                    setPlaceDetails(processedPlace);
                    setIsLoading(false);
                    resolve(processedPlace);
                  } else {
                    const error = new Error(
                      `장소 상세 정보 가져오기 실패: ${detailStatus}`
                    );
                    console.error(error);
                    setError(error.message);
                    setIsLoading(false);
                    reject(error);
                  }
                }
              );
            } else {
              const error = new Error(`장소 검색 실패: ${status}`);
              console.error(error);
              setError(error.message);
              setIsLoading(false);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error("Places API 호출 중 오류 발생:", error);
      setError(error.message);
      setIsLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    const fetchShrineData = async () => {
      try {
        const response = await fetch("/export.geojson");
        const data = await response.json();

        // 데이터 전처리: 중심점 계산
        const processedData = data.features.map((feature) => {
          let center;
          if (feature.geometry.type === "Polygon") {
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
    setPlaceDetails(null); // 새로운 신사 선택시 기존 상세정보 초기화
    fetchPlaceDetails(shrine);
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
    initPlacesService(map);
  };

  return (
    <div className={styles.container}>
      <div className={styles.mapContainer}>
        <MapComponent
          onSelectShrine={handleShrineSelect}
          selectedShrine={selectedShrine}
          onMapLoad={handleMapLoad}
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

            {selectedShrine.properties["addr:full"] && (
              <div className={styles.address}>
                <h4>주소</h4>
                <p>{selectedShrine.properties["addr:full"]}</p>
              </div>
            )}

            {isLoading && (
              <div className={styles.loading}>
                <p>상세 정보를 불러오는 중...</p>
              </div>
            )}

            {error && (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            )}

            {!isLoading && !error && placeDetails && (
              <div className={styles.placeDetails}>
                {placeDetails.photos && placeDetails.photos.length > 0 && (
                  <div className={styles.photos}>
                    <img
                      src={placeDetails.photos[0].getUrl()}
                      alt={selectedShrine.properties.name}
                      className={styles.mainPhoto}
                    />
                  </div>
                )}

                {placeDetails.rating && (
                  <div className={styles.rating}>
                    <h4>평점</h4>
                    <p>
                      ⭐ {placeDetails.rating} / 5.0 (
                      {placeDetails.user_ratings_total}개의 평가)
                    </p>
                  </div>
                )}

                {placeDetails.opening_hours && (
                  <div className={styles.openingHours}>
                    <h4>영업시간</h4>
                    <ul>
                      {placeDetails.opening_hours.weekday_text.map(
                        (hours, idx) => (
                          <li key={idx}>{hours}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {placeDetails.website && (
                  <div className={styles.website}>
                    <h4>웹사이트</h4>
                    <a
                      href={placeDetails.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      방문하기
                    </a>
                  </div>
                )}

                {placeDetails.formatted_phone_number && (
                  <div className={styles.phone}>
                    <h4>전화번호</h4>
                    <p>{placeDetails.formatted_phone_number}</p>
                  </div>
                )}

                {placeDetails.reviews && placeDetails.reviews.length > 0 && (
                  <div className={styles.reviews}>
                    <h4>방문자 리뷰</h4>
                    <div className={styles.reviewList}>
                      {placeDetails.reviews.slice(0, 3).map((review, idx) => (
                        <div key={idx} className={styles.review}>
                          <p className={styles.reviewText}>{review.text}</p>
                          <p className={styles.reviewAuthor}>
                            - {review.author_name} (
                            {review.relative_time_description})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.noSelection}>
            <p>신사를 선택해주세요</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShintoMap;
