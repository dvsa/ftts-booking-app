import { Entitlement } from './entitlement';

const knownEntitlement = (v: string): boolean => Entitlement.isKnown(v);
const toEntitlement = (v: string): Entitlement => Entitlement.of(v);

export class Entitlements {
  public static of(codesCommaSeparated: string): Entitlements {
    const entitlements: Entitlement[] = codesCommaSeparated
      .split(',')
      .filter(knownEntitlement)
      .map(toEntitlement);
    return new Entitlements(entitlements);
  }

  private constructor(private readonly items: Entitlement[]) {}

  public toString(): string {
    return this.joinedBy(',');
  }

  public intersects(entitlements: Entitlements): boolean {
    const exist = (e: Entitlement): boolean => entitlements.items.includes(e);
    return this.items.some(exist);
  }

  public joinedBy(separator: string): string {
    return this.items.join(separator);
  }
}
