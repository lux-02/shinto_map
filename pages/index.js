import Head from "next/head";
import ShintoMap from "../components/ShintoMap";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>일본 신사 지도</title>
        <meta
          name="description"
          content="일본의 신사 위치를 보여주는 지도 서비스"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </Head>

      <main className={styles.main}>
        <ShintoMap />
      </main>
    </div>
  );
}
