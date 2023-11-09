import React, { useEffect, useState } from "react";
import SeedSplitter, { Point } from "./seed-splitter/SeedSplitter.ts";
import styles from "./App.module.css";
import bip39WordList from "./seed-splitter/bip39WordList.ts";
import FieldElement from "./seed-splitter/FieldElement.ts";

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
  const [randomName, setRandomName] = useState<string | null>(null);

  const addRandomPoint = async () => {
    try {
      let name = randomName;

      if (!name) {
        for (let i = 1; ; i++) {
          const candidate = `RANDOM-${i}`;
          
          if (points.every(p => p.name !== candidate)) {
            name = candidate;
            break;
          }
        }
      }

      if (points.some(p => p.name === name)) {
        throw new Error('Point already exists');
      }

      const randomPoint: Point = {
        name,
        mnemonic: await FieldElement.random().toMnemonic(),
      };
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

  useEffect(() => {
    (async () => {
      try {
        if (points.length < 2 || !name) {
          setMnemonic(null);
          return;
        }
        const seedSplitter = await SeedSplitter.fit(points);
        const calculatedMnemonic = await seedSplitter.calculate(name);
        setMnemonic(calculatedMnemonic.join(' '));
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, [name, points]);

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

  const handleDeletePoint = (index: number) => {
    const updatedPoints = points.filter((_, i) => i !== index);
    setPoints(updatedPoints);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Seed Splitter</h1>
      {error && <p className={styles.error}>Error: {error}</p>}

      <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Add a Random Point</h2>
        <input className={styles.input} type="text" placeholder="Optional: Point Name" value={randomName ?? ''} onChange={(e) => setRandomName(normalizeName(e.target.value))} />
        <button className={styles.button} onClick={addRandomPoint}>Add</button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Specify a Point</h2>
        <input
          className={styles.inputName}
          type="text"
          value={newPointName}
          onChange={(e) => setNewPointName(normalizeName(e.target.value))}
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
        <button className={styles.button} onClick={addCustomPoint}>Add</button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Curve</h2>
        {points.length === 0 && "No points yet"}
        <ul className={styles.pointsList}>
          {points.map((point, index) => (
            <li key={index} className={styles.pointItem}>
              <div className={styles.pointContent}>
                <div className={styles.pointName}>{point.name}</div>
                <div className={styles.pointMnemonic}>{point.mnemonic.join(' ')}</div>
              </div>
              <button className={styles.deleteButton} onClick={() => handleDeletePoint(index)}>
                &times; {/* This is a simple 'x' character used as a delete icon */}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Calculate a Point</h2>
        <input className={styles.input} type="text" placeholder="Point Name" value={name} onChange={(e) => setName(normalizeName(e.target.value))} />
        <div className={styles.output}>{mnemonic}</div>
      </div>
    </div>
  );
};

function normalizeName(name: string) {
  return name.replaceAll(' ', '-').toUpperCase();
}

export default App;
