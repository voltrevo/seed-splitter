import FieldElement from "../seed-splitter/FieldElement.ts";
import promptInteger from "./promptInteger.ts";
import promptMnemonic from "./promptSeedPhrase.ts";

export default async function splitExisting() {
  console.log([
    "=========================================================================",
    "===================== Split an Existing Seed Phrase =====================",
    "=========================================================================",
    "",
  ].join("\n"));

  const seedPhrase = await promptMnemonic("Enter your seed phrase:\n");
  const secret = await FieldElement.fromMnemonic(seedPhrase);

  console.log(
    "\nEnter the number of shares that will be needed to recover the secret",
  );

  const K = promptInteger(
    "K:",
    "Please enter a number that is at least 2",
    (k) => k >= 2,
  );

  console.log({ secret, K });
}
