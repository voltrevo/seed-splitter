import SeedSplitter from "./mod.ts";

// const secret =
//   "expire gun route tornado female reflect holiday grief spring clown deliver army";

// const curve = await SeedSplitter.fit([
//   {
//     label: "secret",
//     mnemonic: secret.split(" "),
//   },
//   await SeedSplitter.randomPoint(),
//   await SeedSplitter.randomPoint(),
// ]);

const recoveryData = `
charlotte: valley when dial juice vapor ill payment lunch brass zone alpha topic
daniel: long neutral reject ahead cart proud shoulder auction april same solar match
emily: come foam country senior awkward task possible auction spice hidden sphere giraffe
`;

const curve = await SeedSplitter.fit(
  recoveryData.split("\n").map((line) => {
    if (line.trim() === "") {
      return [];
    }

    const [label, mnemonic] = line.split(": ");

    return { label, mnemonic: mnemonic.split(" ") };
  }).flat(),
);

const names = [
  "secret",
  "ava",
  "benjamin",
  "charlotte",
  "daniel",
  "emily",
  "finn",
  "grace",
];

for (const name of names) {
  console.log(`${name}:`, (await curve.calculate(name)).join(" "));
}
