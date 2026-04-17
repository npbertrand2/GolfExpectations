import { createSampleRoundInput, type RoundInput } from "../test-data";

export class RoundFactory {
  private created: RoundInput[] = [];

  build(overrides: Partial<RoundInput> = {}): RoundInput {
    const round = createSampleRoundInput(overrides);
    this.created.push(round);
    return round;
  }

  cleanup(): void {
    this.created = [];
  }
}
