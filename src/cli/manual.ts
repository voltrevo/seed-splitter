import SeedSplitter, { Point } from "../seed-splitter/SeedSplitter.ts";
import heading from "./heading.ts";
import promptChoices from "./promptChoices.ts";

type State = {
  points: Point[];
  namesToCalculate: string[];
};

export default async function manual() {
  heading("Manual");

  console.log([
    "Welcome to manual mode. This mode reflects the underlying math of",
    "Shamir's Secret Sharing with minimal guidance. It can be used for:",
    "",
    "- Both generation and recovery",
    "- Educational purposes",
    "- Generating additional shares for an existing polynomial",
    "- Other advanced things",
    "",
    "If you're using this mode to protect a valuable key, exercise caution.",
    "Complexity can be a serious liability.",
    "",
  ].join("\n"));

  prompt("", "Press enter to continue");
  console.log();

  const state: State = {
    points: [],
    namesToCalculate: [],
  };

  while (true) {
    render(state);
    console.log();

    const choice = promptChoices([
      ["Specify a point", async () => {
      }],
      ["Remove a specified point", async () => {
      }],
      ["Add a point for calculation", async () => {
      }],
      ["Exit", () => {
        Deno.exit(0);
      }],
    ]);

    await choice();
    console.log();
  }
}

async function render(state: State) {
  heading("Manual");

  if (state.points.length === 0) {
    console.log("No points yet");
    return;
  }

  const ss = await SeedSplitter.fit(state.points);

  console.log("\nSpecified points:");
  renderNames("    ", state.points.map((p) => p.name), ss);

  console.log("\nCalculated points:");
  renderNames("    ", state.namesToCalculate, ss);
}

async function renderNames(indent: string, names: string[], ss: SeedSplitter) {
  if (names.length === 0) {
    console.log(`${indent}(none)`);
  }

  const longestNameLen = names
    .map((n) => n.length)
    .reduce((a, b) => Math.max(a, b));

  for (const name of names) {
    const namePrefix = `${name}:`.padEnd(longestNameLen + 1);

    console.log(
      `${indent}${namePrefix} ${(await ss.calculate(name)).join(" ")}`,
    );
  }
}
