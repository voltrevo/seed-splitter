import promptChoices from "./promptChoices.ts";
import splitExisting from "./splitExisting.ts";
import todo from "./todo.ts";

export default async function main() {
  console.log([
    "=========================================================================",
    "============================= Seed Splitter =============================",
    "=========================================================================",
    "",
    "This is a tool which splits 12-word seed phrases.",
    "",
    "It does this by fitting a polynomial to K points of your choosing. Once",
    "this polynomial has been found, you can then calculate any other points",
    "you like.",
    "",
    "Later, you can recalculate the same polynomial using any K of these",
    "points, not just the ones that originally generated the polynomial. With",
    "this same polynomial, you can recalculate any of the other points.",
    "",
  ].join("\n"));

  const choice = promptChoices([
    ["Split an existing seed phrase", splitExisting],
    ["Generate and split a seed phrase", todo("generateAndSplit")],
    ["Recover a seed phrase", todo("recover")],
    ["Manual mode", todo("manual")],
  ]);

  console.clear();

  await choice();
}
