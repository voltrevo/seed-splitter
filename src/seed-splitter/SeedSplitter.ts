import FieldElement from "./FieldElement.ts";
import Polynomial from "./Polynomial.ts";

export type Point = {
  name: string;
  mnemonic: string[];
};

export default class SeedSplitter {
  private constructor(public poly: Polynomial) {}

  static async fit(points: Point[]) {
    const rawPoints = await Promise.all(
      points.map(async ({ name, mnemonic }) => ({
        x: FieldElement.fromName(name),
        y: await FieldElement.fromMnemonic(mnemonic),
      })),
    );

    let sum = new Polynomial([]);

    for (const share of rawPoints) {
      let poly = new Polynomial([new FieldElement(1n)]);

      for (const otherShare of rawPoints) {
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
          poly.calculate(share.x).inverse().mul(share.y),
        ]),
      );

      sum = sum.add(poly);
    }

    return new SeedSplitter(sum);
  }

  async calculate(name: string) {
    const x = FieldElement.fromName(name);
    const y = this.poly.calculate(x);

    return await y.toMnemonic();
  }

  static async randomPoint(): Promise<Point> {
    return {
      name: FieldElement.random().toName(),
      mnemonic: await FieldElement.random().toMnemonic(),
    };
  }
}
