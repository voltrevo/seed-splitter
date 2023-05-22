import heading from "./heading.ts";
import manual from "./manual.ts";
import promptChoices from "./promptChoices.ts";
import recover from "./recover.ts";
import split from "./split.ts";

export default async function main() {
  heading("Seed Splitter");

  console.log([
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
    "This technique is known as Shamir's secret sharing.",
    "",
  ].join("\n"));

  const choice = promptChoices([
    ["Split an existing seed phrase", split(false)],
    ["Generate and split a seed phrase", split(true)],
    ["Recover a seed phrase", recover],
    ["Manual mode", manual],
  ]);

  console.log();

  await choice();
}
