import bip39WordList from "./bip39WordList.ts";

const P = 2n ** 128n - 159n; // The largest prime below 2**128

const nameChars = "-abcdefghijklmnopqrstuvwxyz0123456789";

class FieldElement {
  constructor(public n: bigint) {}

  add(other: FieldElement): FieldElement {
    return new FieldElement((this.n + other.n) % P);
  }

  sub(other: FieldElement): FieldElement {
    return new FieldElement((this.n - other.n + P) % P);
  }

  mul(other: FieldElement): FieldElement {
    return new FieldElement((this.n * other.n) % P);
  }

  negate(): FieldElement {
    return new FieldElement((-this.n + P) % P);
  }

  pow(exponent: bigint): FieldElement {
    let result = new FieldElement(1n);

    // deno-lint-ignore no-this-alias
    let base: FieldElement = this;

    while (exponent > 0n) {
      if (exponent & 1n) {
        result = result.mul(base);
      }

      base = base.mul(base);
      exponent >>= 1n;
    }

    return result;
  }

  inverse(): FieldElement {
    return this.pow(P - 2n);
  }

  static random(): FieldElement {
    const buf = crypto.getRandomValues(new Uint8Array(16));
    return FieldElement.fromBuffer(buf);
  }

  static fromBuffer(buf: Uint8Array) {
    if (buf.length !== 16) {
      throw new Error("Buffer should be 16 bytes");
    }

    let n = 0n;

    for (let i = 0; i < 16; i++) {
      n *= 256n;
      n += BigInt(buf[i]);
    }

    return new FieldElement(n);
  }

  toBuffer(): Uint8Array {
    let x = this.n;

    const buf = new Uint8Array(16);

    for (let i = 15; i >= 0; i--) {
      buf[i] = Number(x % 256n);
      x /= 256n;
    }

    return buf;
  }

  async toMnemonic(): Promise<string[]> {
    const buf = this.toBuffer();

    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", buf));

    let x = this.n;

    const wordNums: number[] = [
      (Number(x % 128n) << 4) + (hash[0] >> 4),
    ];

    x /= 128n;

    for (let i = 0; i < 11; i++) {
      wordNums.unshift(Number(x % 2048n));
      x /= 2048n;
    }

    return wordNums.map((n) => bip39WordList[n]);
  }

  static async fromMnemonic(words: string[]) {
    if (words.length !== 12) {
      throw new Error("Only 12-word mnemonics are supported");
    }

    let x = 0n;

    for (const word of words) {
      x *= 2048n;
      x += BigInt(bip39WordList.indexOf(word));
    }

    const checksum = Number(x % 16n);
    x /= 16n;

    const fieldElement = new FieldElement(x);

    const hash = new Uint8Array(
      await crypto.subtle.digest("SHA-256", fieldElement.toBuffer()),
    );

    if (checksum !== (hash[0] >> 4)) {
      throw new Error("Checksum doesn't match");
    }

    return fieldElement;
  }

  toName() {
    let name = "";

    let x = this.n;

    while (x > 0n) {
      name = nameChars[Number(x % 37n)] + name;
      x /= 37n;
    }

    return name;
  }

  static fromName(name: string) {
    let x = 0n;

    for (let c of name) {
      x *= BigInt(nameChars.length);

      if (["_", " "].includes(c)) {
        c = "-";
      } else {
        c = c.toLowerCase();
      }

      const index = nameChars.indexOf(c);

      if (index === -1) {
        throw new Error(`Unsupported character '${c}'`);
      }

      x += BigInt(index);
    }

    return new FieldElement(x);
  }
}

export default FieldElement;
