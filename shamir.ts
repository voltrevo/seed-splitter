import FieldElement from "./FieldElement.ts";
import Polynomial from "./Polynomial.ts";

type Point = { x: FieldElement; y: FieldElement };

export function generate(
  secret: FieldElement,
  k: number,
  n: number,
): Point[] {
  const poly = new Polynomial([
    secret,
    ...[...new Array(k - 1)].map(() => FieldElement.random()),
  ]);

  const shares = [...new Array(n)].map((_, i) => {
    const x = new FieldElement(BigInt(i) + 1n);
    return { x, y: poly.eval(x) };
  });

  return shares;
}

export function recover(shares: Point[]) {
  let sum = new Polynomial([]);

  for (const share of shares) {
    let poly = new Polynomial([new FieldElement(1n)]);

    for (const otherShare of shares) {
      if (otherShare === share) {
        continue;
      }

      poly = poly.mul(
        new Polynomial([
          otherShare.x,
          new FieldElement(1n).negate(),
        ]),
      );
    }

    poly = poly.mul(
      new Polynomial([
        poly.eval(share.x).inverse().mul(share.y),
      ]),
    );

    sum = sum.add(poly);
  }

  return sum.eval(new FieldElement(0n));
}
