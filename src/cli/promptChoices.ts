import promptInteger from "./promptInteger.ts";

type Choice<T> = [
  description: string,
  value: T,
];

export default function promptChoices<T>(choices: Choice<T>[]) {
  for (const [i, [description]] of choices.entries()) {
    console.log(`    ${i + 1}. ${description}`);
  }

  console.log();

  const invalidMessage =
    `Please enter a number from 1 to ${choices.length} (or 'exit')`;

  while (true) {
    const input = promptInteger("Choice:", invalidMessage);
    const choice = choices.at(input - 1);

    if (choice === undefined) {
      console.log(invalidMessage);
      continue;
    }

    return choice[1];
  }
}
