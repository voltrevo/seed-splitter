type Choice<T> = [
  description: string,
  value: T,
];

export default function promptChoices<T>(choices: Choice<T>[]) {
  for (const [i, [description]] of choices.entries()) {
    console.log(`    ${i + 1}. ${description}`);
  }

  console.log();

  while (true) {
    const input = prompt("Choice:");

    if (input !== null && ["exit", "quit", "stop"].includes(input)) {
      Deno.exit(0);
    }

    const inputNum = parseInt(input ?? "x", 10);

    const choice = choices.at(inputNum - 1);

    if (
      input === null ||
      !/^ *[1-9][0-9]* *$/.test(input) ||
      choice === undefined
    ) {
      console.log(
        `Please enter a number from 1 to ${choices.length} (or 'exit')`,
      );

      continue;
    }

    return choice[1];
  }
}
