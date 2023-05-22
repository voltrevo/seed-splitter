import FieldElement from "../seed-splitter/FieldElement.ts";
import bip39WordList from "../seed-splitter/bip39WordList.ts";

export default async function splitExisting() {
  console.log([
    "=========================================================================",
    "===================== Split an Existing Seed Phrase =====================",
    "=========================================================================",
    "",
  ].join("\n"));

  let seedPhrase: string[];

  while (true) {
    // TODO: Handle the 159 unsupported phrases
    const input = prompt("Enter your seed phrase:\n   ");

    if (input === null) {
      continue;
    }

    const inputPhrase = input
      .trim()
      .split(" ")
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word !== "");

    for (const word of inputPhrase) {
      if (!bip39WordList.includes(word)) {
        console.log(
          `Invalid seed phrase: ${word} is not in the bip39 standard`,
        );

        continue;
      }
    }

    seedPhrase = inputPhrase;
    break;
  }

  const secret = await FieldElement.fromMnemonic(seedPhrase);

  console.log(
    "K is the number of shares that will be needed to recover the secret",
  );

  let K: number;

  while (true) {
    const kInput = prompt("K:");
    K = parseInt(kInput ?? "x", 10);

    if (kInput === null || !/^ *[1-9][0-9]* *$/.test(kInput) || K < 2) {
      console.log("Please enter a number that is at least 2");
      continue;
    }

    break;
  }

  console.log({ secret, K });
}
