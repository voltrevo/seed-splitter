import SeedSplitter from "../mod.ts";

const secret =
  "vault soap student engine hub blanket tortoise fit device critic stage clay";

const ss = await SeedSplitter.fit([
  { name: "secret", mnemonic: secret.split(" ") },
  await SeedSplitter.randomPoint(),
  await SeedSplitter.randomPoint(),
]);

for (const name of ["benjamin", "charlotte", "drawer", "car", "backyard"]) {
  console.log(
    `${(name + ":").padEnd(10, " ")}`,
    (await ss.calculate(name)).join(" "),
  );
}
