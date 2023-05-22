import FieldElement from "./FieldElement.ts";
import Polynomial from "./Polynomial.ts";

export type Point = {
  label: string;
  mnemonic: string[];
};

export default class SeedSplitter {
  private constructor(public poly: Polynomial) {}

  static async fit(points: Point[]) {
    const rawPoints = await Promise.all(
      points.map(async ({ label, mnemonic }) => ({
        x: FieldElement.fromLabel(label),
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

  async calculate(label: string) {
    const x = FieldElement.fromLabel(label);
    const y = this.poly.calculate(x);

    return await y.toMnemonic();
  }

  static async randomPoint(): Promise<Point> {
    return {
      label: FieldElement.random().toLabel(),
      mnemonic: await FieldElement.random().toMnemonic(),
    };
  }
}
