import { Licence } from './licence';
import { TheoryTest } from './theory-test';

export class TheoryTests {
  constructor(private readonly items: TheoryTest[]) {}

  public get(): TheoryTest[] {
    return this.items;
  }

  public availableTo(license: Licence): TheoryTests {
    const byAvailability = (theoryTest: TheoryTest): boolean => theoryTest.availableTo(license);
    return new TheoryTests(this.items.filter(byAvailability));
  }

  public minus(subtrahend: TheoryTests): TheoryTests {
    const notInSubtrahend = (t: TheoryTest): boolean => !subtrahend.items.includes(t);
    return new TheoryTests(this.items.filter(notInSubtrahend));
  }

  public contains(theoryTest: TheoryTest): boolean {
    return this.items.includes(theoryTest);
  }
}
