const knownEntitlements = ['B', 'B auto', 'AM', 'A1', 'A2', 'A'];

export class Entitlement {
  public static isKnown(code: string): boolean {
    return this.known.has(code);
  }

  public static of(code: string): Entitlement {
    const entitlement = this.known.get(code);
    if (entitlement === undefined) {
      throw new RangeError(`Entitlement ${code} is unknown`);
    }
    return entitlement;
  }

  private static readonly known: Map<string, Entitlement> = Entitlement.makeKnown();

  private static makeKnown(): Map<string, Entitlement> {
    const known: Map<string, Entitlement> = new Map();
    const addToKnown = (v: string): Map<string, Entitlement> => known.set(v, new Entitlement(v));
    knownEntitlements.forEach(addToKnown);
    return known;
  }

  private constructor(private readonly code: string) {}

  public toString(): string {
    return this.code;
  }
}
