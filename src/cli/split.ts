import FieldElement from "../seed-splitter/FieldElement.ts";
import SeedSplitter from "../seed-splitter/SeedSplitter.ts";
import heading from "./heading.ts";
import promptInteger from "./promptInteger.ts";
import promptMnemonic from "./promptSeedPhrase.ts";

export default function split(generate: boolean) {
  return async () => {
    heading(
      generate
        ? "Generate and Split a Seed Phrase"
        : "Split an Existing Seed Phrase",
    );

    let seedPhrase: string[];

    if (generate) {
      seedPhrase = await FieldElement.random().toMnemonic();

      console.log(`Seed phrase:\n    ${seedPhrase.join(" ")}`);

      console.log([
        "",
        "You might not have an immediate use for this, but you will at least",
        "need to refer to it when checking the recovery process.",
        "",
      ].join("\n"));

      prompt("", "Press enter to continue");
    } else {
      seedPhrase = await promptMnemonic("Enter your seed phrase:\n");
    }

    console.log(
      "\nEnter the number of shares that will be needed to recover the secret",
    );

    const K = promptInteger(
      "K:",
      "Please enter a number that is at least 2",
      (k) => k >= 2,
    );

    const randomPoints = await Promise.all(
      new Array(K - 1).fill(0).map(async (_, i) => ({
        name: `random-${i + 1}`,
        mnemonic: await FieldElement.random().toMnemonic(),
      })),
    );

    const seedSplitter = await SeedSplitter.fit([
      { name: "secret", mnemonic: seedPhrase },
      ...randomPoints,
    ]);

    console.log([
      "",
      `Your polynomial has been fitted. Now enter the names for at least ${K}`,
      "shares. A share is a point on your polynomial, and the name of the",
      "share encodes its X coordinate. Names are required for recovery.",
      "",
      "Names consist of letters, numbers, and separators. They are case",
      "insensitive and the separators are interchangeable (space, hyphen,",
      "underscore).",
      "",
    ].join("\n"));

    const names: string[] = [];

    while (true) {
      let name: string | null;

      if (names.length < K) {
        name = prompt(`Enter the name of share #${names.length + 1}:`);
      } else {
        const default_ = "(or enter to finish)";

        name = prompt(
          `Enter the name of share #${names.length + 1}:`,
          default_,
        );

        if (name === default_) {
          break;
        }
      }

      if (name === null) {
        continue;
      }

      try {
        name = FieldElement.fromName(name).toName(); // Normalize
        names.push(name);
      } catch (error) {
        console.error(error.message);
      }
    }

    console.log();
    heading("Secret Shares");

    const longestNameLen = names
      .map((n) => n.length)
      .reduce((a, b) => Math.max(a, b));

    for (const name of names) {
      const namePrefix = `${name}:`.padEnd(longestNameLen + 1);

      console.log(
        `${namePrefix} ${(await seedSplitter.calculate(name)).join(" ")}`,
      );
    }

    console.log([
      "",
      `Your seed phrase is stored under the name "secret" on this polynomial.`,
      `Any ${K} shares can be used to recover it.`,
      "",
      "Make sure you test recovery before relying on it. You'll need a copy of",
      "this software to do the recovery, so you may want to store this",
      "software alongside each share.",
      "",
      "It's also a good idea to give this polynomial a name and include that",
      "name with each share. If you have multiple of these, you'll need to",
      "know which polynomial each share belongs to.",
    ].join("\n"));
  };
}
