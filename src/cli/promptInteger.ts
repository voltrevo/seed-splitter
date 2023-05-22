export default function promptInteger(
  message: string,
  invalidMessage: string,
  constraint: (inputNum: number) => boolean = () => true,
) {
  while (true) {
    const input = prompt(message);

    if (input !== null && ["exit", "quit", "stop"].includes(input)) {
      Deno.exit(0);
    }

    if (input === null || !/^ *[1-9][0-9]* *$/.test(input)) {
      console.log(invalidMessage);
      continue;
    }

    const inputNum = parseInt(input, 10);

    if (!constraint(inputNum)) {
      console.log(invalidMessage);
      continue;
    }

    return inputNum;
  }
}
