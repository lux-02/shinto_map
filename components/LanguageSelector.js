import { useLanguage } from "../contexts/LanguageContext";
import styles from "./LanguageSelector.module.css";

export default function LanguageSelector() {
  const { currentLanguage, setCurrentLanguage } = useLanguage();

  return (
    <div className={styles.languageSelector}>
      <select
        value={currentLanguage}
        onChange={(e) => setCurrentLanguage(e.target.value)}
        className={styles.select}
      >
        <option value="ja">日本語</option>
        <option value="en">English</option>
        <option value="ko">한국어</option>
      </select>
    </div>
  );
}
