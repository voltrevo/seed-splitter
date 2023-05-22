console.log([
  "===========================================================================",
  "============================== Seed Splitter ==============================",
  "===========================================================================",
  "",
  "This is a tool which splits 12-word seed phrases.",
  "",
  "It does this by fitting a polynomial to K points of your choosing. Once",
  "this polynomial has been found, you can then calculate any other points you",
  "like.",
  "",
  "Later, you can recalculate the same polynomial using any K of these points,",
  "not just the ones that originally generated the polynomial. With this same",
  "polynomial, you can recalculate any of the other points.",
  "",
  "    1. Split an existing seed phrase",
  "    2. Generate and split a seed phrase",
  "    3. Recover a seed phrase",
  "    4. Manual mode",
  "",
].join("\n"));

let choice: "1" | "2" | "3" | "4";

const exitInputs: (string | null)[] = ["exit", "quit", "stop"];

while (true) {
  const input = prompt("Choice:");

  if (exitInputs.includes(input)) {
    Deno.exit(0);
  }

  if (input !== "1" && input !== "2" && input !== "3" && input !== "4") {
    console.log("Please choose 1, 2, 3, or 4");
    continue;
  } else {
    choice = input;
    break;
  }
}

console.log({ choice });
