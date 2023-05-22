import FieldElement from "./FieldElement.ts";

export default class Polynomial {
  constructor(public coeffs: FieldElement[]) {}

  add(other: Polynomial) {
    const res = new Polynomial(new Array(
      Math.max(this.coeffs.length, other.coeffs.length),
    ).fill(new FieldElement(0n)));

    for (const poly of [this, other]) {
      for (const [i, coeff] of poly.coeffs.entries()) {
        res.coeffs[i] = res.coeffs[i].add(coeff);
      }
    }

    return res;
  }

  mul(other: Polynomial) {
    if (this.coeffs.length === 0 || other.coeffs.length === 0) {
      return new Polynomial([]);
    }

    const res = new Polynomial(new Array(
      this.coeffs.length + other.coeffs.length - 1,
    ).fill(new FieldElement(0n)));

    for (const [i, ai] of this.coeffs.entries()) {
      for (const [j, bj] of other.coeffs.entries()) {
        res.coeffs[i + j] = res.coeffs[i + j].add(ai.mul(bj));
      }
    }

    return res;
  }

  calculate(x: FieldElement) {
    if (this.coeffs.length === 0) {
      return new FieldElement(0n);
    }

    let sum = new FieldElement(0n);
    let xPow = new FieldElement(1n);

    for (const coeff of this.coeffs) {
      sum = sum.add(coeff.mul(xPow));
      xPow = xPow.mul(x);
    }

    return sum;
  }
}
