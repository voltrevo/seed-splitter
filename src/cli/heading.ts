export default function heading(text: string) {
  const line =
    "=========================================================================";

  const sideLen = (line.length - (text.length + 2)) / 2;

  console.log([
    line,
    [
      "=".repeat(Math.floor(sideLen)),
      text,
      "=".repeat(Math.ceil(sideLen)),
    ].join(" "),
    line,
    "",
  ].join("\n"));
}
