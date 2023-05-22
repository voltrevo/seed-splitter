import SeedSplitter from "../mod.ts";

const recoveryData = `
charlotte: evidence foil nut riot draft bronze shine town meat strategy fit broom
car:       credit spoil coin drip camera risk ginger just delay spider correct soap
backyard:  silent merit way main shop when toward spirit wolf catch level face
`;

const ss = await SeedSplitter.fit(
  recoveryData.split("\n").map((line) => {
    if (line.trim() === "") {
      return [];
    }

    const [name, mnemonic] = line
      .split(": ")
      .map((part) => part.trim());

    return { name, mnemonic: mnemonic.split(" ") };
  }).flat(),
);

console.log((await ss.calculate("secret")).join(" "));
