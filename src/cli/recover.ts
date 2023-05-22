import FieldElement from "../seed-splitter/FieldElement.ts";
import SeedSplitter, { Point } from "../seed-splitter/SeedSplitter.ts";
import promptInteger from "./promptInteger.ts";
import promptMnemonic from "./promptSeedPhrase.ts";

export default async function recover() {
  console.log(
    "Enter the number of shares needed to recover the secret",
  );

  const K = promptInteger(
    "K:",
    "Please enter a number that is at least 2",
    (k) => k >= 2,
  );

  const points: Point[] = [];

  while (points.length < K) {
    let name = prompt("\nName:");

    if (name === null) {
      continue;
    }

    try {
      name = FieldElement.fromName(name).toName();
    } catch (error) {
      console.error(error.message);
      continue;
    }

    const mnemonic = await promptMnemonic("Mnemonic:");

    points.push({ name, mnemonic });
  }

  const seedSplitter = await SeedSplitter.fit(points);

  console.log(
    `\nSeed phrase:\n    ${(await seedSplitter.calculate("secret")).join(" ")}`,
  );
}
