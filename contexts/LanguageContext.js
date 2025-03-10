import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export const languages = {
  ja: {
    selectShrine: "神社を選択してください",
    location: "位置情報",
    latitude: "緯度",
    longitude: "経度",
    address: "住所",
    rating: "評価",
    reviews: "レビュー",
    openingHours: "営業時間",
    website: "ウェブサイト",
    visitWebsite: "訪問する",
    phone: "電話番号",
    loading: "読み込み中...",
    error: "エラーが発生しました",
    reviewCount: "件のレビュー",
  },
  en: {
    selectShrine: "Select a Shrine",
    location: "Location",
    latitude: "Latitude",
    longitude: "Longitude",
    address: "Address",
    rating: "Rating",
    reviews: "Reviews",
    openingHours: "Opening Hours",
    website: "Website",
    visitWebsite: "Visit",
    phone: "Phone",
    loading: "Loading...",
    error: "An error occurred",
    reviewCount: "reviews",
  },
  ko: {
    selectShrine: "신사를 선택해주세요",
    location: "위치 정보",
    latitude: "위도",
    longitude: "경도",
    address: "주소",
    rating: "평점",
    reviews: "방문자 리뷰",
    openingHours: "영업시간",
    website: "웹사이트",
    visitWebsite: "방문하기",
    phone: "전화번호",
    loading: "로딩중...",
    error: "오류가 발생했습니다",
    reviewCount: "개의 평가",
  },
};

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState("ja");

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
