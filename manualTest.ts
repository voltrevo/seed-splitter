// import * as shamir from "./shamir.ts";
// import FieldElement from "./FieldElement.ts";
import RecoveryCurve from "./RecoveryCurve.ts";

// const shares = shamir.generate(new FieldElement(123n), 2, 3);

// console.log(
//   await Promise.all(
//     shares.map(async (s) =>
//       `${Number(s.x.n)}: ${(await s.y.toMnemonic()).join(" ")}`
//     ),
//   ),
// );

// const recovered = shamir.recover([shares[0], shares[2]]);

// console.log((await recovered.toMnemonic()).join(" "));

// const secret =
//   "expire gun route tornado female reflect holiday grief spring clown deliver army";

// const curve = await RecoveryCurve.fit([
//   {
//     label: "secret",
//     mnemonic: secret.split(" "),
//   },
//   await RecoveryCurve.randomPoint(),
//   await RecoveryCurve.randomPoint(),
// ]);

const recoveryData = `
charlotte: valley when dial juice vapor ill payment lunch brass zone alpha topic
daniel: long neutral reject ahead cart proud shoulder auction april same solar match
emily: junior coach innocent fragile aware ritual recipe rhythm equal vicious path tray
`;

const curve = await RecoveryCurve.fit(
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
  console.log(`${name}:`, (await curve.eval(name)).join(" "));
}
