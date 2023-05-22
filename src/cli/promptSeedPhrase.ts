import FieldElement from "../seed-splitter/FieldElement.ts";
import bip39WordList from "../seed-splitter/bip39WordList.ts";

export default async function promptMnemonic(
  message: string,
  allowRandom = false,
) {
  // TODO: Handle the 159 unsupported phrases

  while (true) {
    let input: string | null;

    if (allowRandom) {
      input = prompt(message, "random");

      if (input === "random") {
        return await FieldElement.random().toMnemonic();
      }
    } else {
      input = prompt(message);
    }

    if (input === null) {
      continue;
    }

    const mnemonic = input
      .trim()
      .split(" ")
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word !== "");

    for (const word of mnemonic) {
      if (!bip39WordList.includes(word)) {
        console.log(
          `Invalid mnemonic: ${word} is not in the bip39 standard`,
        );

        continue;
      }
    }

    return mnemonic;
  }
}
