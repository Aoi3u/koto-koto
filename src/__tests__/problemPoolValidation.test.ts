import {
  isProblemPayloadValid,
  validateProblemSeedRecords,
  type ProblemSeedRecord,
} from '../lib/problemPool';

describe('problemPool validation', () => {
  test('accepts valid records', () => {
    const records: ProblemSeedRecord[] = [
      {
        mode: 'classic',
        problemKey: 'classic_001',
        display: '吾輩は猫である。',
        reading: 'わがはいはねこである。',
      },
      {
        mode: 'word-endless',
        problemKey: 'word_0001',
        display: '青空',
        reading: 'あおぞら',
      },
    ];

    const validated = validateProblemSeedRecords(records);
    expect(validated).toHaveLength(2);
    expect(validated[0].contentHash).toBeTruthy();
  });

  test('rejects duplicate problem keys', () => {
    const records: ProblemSeedRecord[] = [
      {
        mode: 'classic',
        problemKey: 'dup',
        display: '表示1',
        reading: 'ひょうじいち',
      },
      {
        mode: 'word-endless',
        problemKey: 'dup',
        display: '表示2',
        reading: 'ひょうじに',
      },
    ];

    expect(() => validateProblemSeedRecords(records)).toThrow('duplicate problemKey');
  });

  test('rejects unsupported reading characters', () => {
    const records: ProblemSeedRecord[] = [
      {
        mode: 'classic',
        problemKey: 'invalid_reading',
        display: 'Hello',
        reading: 'hello',
      },
    ];

    expect(() => validateProblemSeedRecords(records)).toThrow('unsupported characters');
  });

  test('payload validation checks id/display/reading and reading charset', () => {
    expect(
      isProblemPayloadValid({
        id: 'ok',
        display: '海辺',
        reading: 'うみべ',
      })
    ).toBe(true);

    expect(
      isProblemPayloadValid({
        id: 'bad',
        display: 'Test',
        reading: 'abc',
      })
    ).toBe(false);
  });
});
