import { Entitlements } from './entitlements';
import { Licence } from './licence';
import { translate } from '../../helpers/language';

export class TheoryTest {
  public static of(name: string): TheoryTest {
    const theoryTest = this.known.get(name.toLowerCase());
    if (theoryTest === undefined) {
      throw new RangeError(`Theory Test ${name} is unknown`);
    }
    return theoryTest;
  }

  public static allKnown(): TheoryTest[] {
    return [...this.known.values()];
  }

  public static isValid(value: string): boolean {
    if (value === undefined) {
      throw new TypeError(translate('testType.validationError'));
    }
    return TheoryTest.of(value) instanceof TheoryTest;
  }

  private static readonly known: Map<string, TheoryTest> = TheoryTest.makeKnown();

  private static makeKnown(): Map<string, TheoryTest> {
    const known: Map<string, TheoryTest> = new Map();
    new TheoryTest('Car', Entitlements.of('B,B auto')).addTo(known);
    new TheoryTest('Motorcycle', Entitlements.of('AM,A1,A2,A')).addTo(known);
    return known;
  }

  private constructor(
    private readonly name: string,
    private readonly entitlements: Entitlements,
  ) {}

  public availableTo(license: Licence): boolean {
    return license.doesNotInclude(this.entitlements);
  }

  public toString(): string {
    return this.name;
  }

  public description(): string {
    return `${this.name} category ${this.entitlements.joinedBy('/')}`;
  }

  private addTo(lookup: Map<string, TheoryTest>): void {
    lookup.set(this.name.toLowerCase(), this);
  }
}
