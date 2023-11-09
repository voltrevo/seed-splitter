import React, { useEffect, useState } from "react";
import SeedSplitter, { Point } from "./seed-splitter/SeedSplitter.ts";
import styles from "./App.module.css";
import bip39WordList from "./seed-splitter/bip39WordList.ts";

const App: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [name, setName] = useState<string>("");
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newPointName, setNewPointName] = useState<string>("");
  const [newPointMnemonic, setNewPointMnemonic] = useState<string>("");
  const [mnemonicWords, setMnemonicWords] = useState<string[]>(Array(12).fill(''));
  const [validWords, setValidWords] = useState<boolean[]>(Array(12).fill(false));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const addPoint = async () => {
    try {
      const randomPoint = await SeedSplitter.randomPoint();
      setPoints([...points, randomPoint]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addCustomPoint = () => {
    try {
      if (!newPointName || !newPointMnemonic) {
        throw new Error("Both name and mnemonic must be provided.");
      }
      const customPoint = {
        name: newPointName,
        mnemonic: newPointMnemonic.split(" "),
      };
      setPoints([...points, customPoint]);
      setNewPointName("");
      setNewPointMnemonic("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const calculateMnemonic = async () => {
    try {
      if (points.length < 2) {
        throw new Error("You need at least two points to fit a polynomial.");
      }
      const seedSplitter = await SeedSplitter.fit(points);
      const calculatedMnemonic = await seedSplitter.calculate(name);
      setMnemonic(calculatedMnemonic.join(' '));
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    setValidWords(mnemonicWords.map((word, index) => 
      !word || bip39WordList.includes(word.toLowerCase())));
  }, [mnemonicWords]);

  const handleMnemonicChange = (index: number, word: string) => {
    const newMnemonicWords = [...mnemonicWords];
    newMnemonicWords[index] = word.trim();
    setMnemonicWords(newMnemonicWords);
  };

  const isSubstringOfWord = (word: string) => {
    return bip39WordList.some((validWord) => validWord.startsWith(word.toLowerCase()));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Seed Splitter</h1>
      {error && <p className={styles.error}>Error: {error}</p>}

      <div className={styles.section}>
        <button className={styles.button} onClick={addPoint}>Add Random Point</button>
      </div>

      <div className={styles.section}>
        <input className={styles.input} type="text" placeholder="Point Name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className={styles.button} onClick={calculateMnemonic}>Calculate Point</button>
        {mnemonic && <div className={styles.output}>Mnemonic: {mnemonic}</div>}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Add a Custom Point</h2>
        <input
          className={styles.inputName}
          type="text"
          value={newPointName}
          onChange={(e) => setNewPointName(e.target.value)}
          placeholder="Point Name"
        />
        <div className={styles.grid}>
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className={styles.gridItem}>
              <label className={styles.gridNumber}>{index + 1}.</label>
              <input
                className={`${styles.input} ${
                  !mnemonicWords[index] ? '' : 
                  validWords[index] ? styles.valid : 
                  focusedIndex === index && isSubstringOfWord(mnemonicWords[index]) ? styles.warning : styles.invalid
                }`}
                type="text"
                value={mnemonicWords[index] || ''}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                onChange={(e) => handleMnemonicChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        <button className={styles.button} onClick={addCustomPoint}>Add Point</button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Points</h2>
        <ul className={styles.pointsList}>
          {points.map((point, index) => (
            <li key={index} className={styles.pointItem}>
              <div className={styles.pointName}>{point.name}</div>
              <div className={styles.pointMnemonic}>{point.mnemonic.join(' ')}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
