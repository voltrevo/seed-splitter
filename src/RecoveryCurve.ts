import FieldElement from "./FieldElement.ts";
import Polynomial from "./Polynomial.ts";

type Point = {
  label: string;
  mnemonic: string[];
};

export default class RecoveryCurve {
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
          poly.eval(share.x).inverse().mul(share.y),
        ]),
      );

      sum = sum.add(poly);
    }

    return new RecoveryCurve(sum);
  }

  async eval(label: string) {
    const x = FieldElement.fromLabel(label);
    const y = this.poly.eval(x);

    return await y.toMnemonic();
  }

  static async randomPoint(): Promise<Point> {
    return {
      label: FieldElement.random().toLabel(),
      mnemonic: await FieldElement.random().toMnemonic(),
    };
  }
}
