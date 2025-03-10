# 신토 맵 (Shinto Map) 🗾

일본의 신사 위치를 인터랙티브하게 탐색할 수 있는 웹 기반 지도 서비스입니다. 사용자들이 일본 전역의 신사들을 쉽게 찾고 관련 정보를 확인할 수 있도록 도와주는 플랫폼입니다.

## ✨ 주요 기능

- 🗺️ **인터랙티브 지도**

  - Google Maps API 기반의 사용자 친화적 인터페이스
  - 부드러운 줌 인/아웃 기능
  - 반응형 디자인으로 모든 디바이스 지원

- 📍 **신사 정보 시각화**

  - 정확한 위치 마커 표시
  - 마커 클러스터링으로 효율적인 정보 표시
  - 선택한 신사의 상세 정보 사이드바 표시

- 🎯 **상세 정보 제공**

  - 신사 이름 (일본어/영어)
  - 정확한 GPS 좌표
  - 상세 주소 정보
  - 신사 관련 부가 정보

- 🌓 **테마 지원**
  - 시스템 설정 기반 자동 다크 모드
  - 사용자 환경에 최적화된 지도 스타일

## 🛠 기술 스택

### Frontend

- **Framework**: React.js, Next.js 15.2.1
- **Maps**: @react-google-maps/api ^2.20.6
- **Styling**: CSS Modules, Tailwind CSS

### Development

- **Language**: JavaScript
- **Package Manager**: npm/yarn
- **Code Quality**: ESLint
- **Version Control**: Git

## 📁 프로젝트 구조

shinto_map/
├── components/ # 리액트 컴포넌트
│ ├── MapComponent.js # 구글 맵 컴포넌트
│ └── ShintoMap.js # 메인 지도 컴포넌트
├── pages/ # Next.js 페이지
│ ├── app.js # 앱 설정
│ ├── document.js # 문서 설정
│ ├── index.js # 메인 페이지
│ └── api/ # API 라우트
├── styles/ # 스타일시트
│ ├── globals.css # 전역 스타일
│ └── .module.css # 컴포넌트별 스타일
├── public/ # 정적 파일
└── next.config.mjs # Next.js 설정

## 📊 데이터 구조

신사 데이터는 GeoJSON 형식으로 제공되며 다음 속성을 포함합니다:

```javascript
{
  "type": "Feature",
  "properties": {
    "name": "神社名",           // 신사 이름 (일본어)
    "name:en": "Shrine Name",  // 신사 이름 (영어)
    "addr:full": "住所",       // 상세 주소
    "type": "神社"            // 시설 유형
  },
  "geometry": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  }
}
```
