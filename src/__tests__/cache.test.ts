import { getOrSetCache, __clearCacheForTests } from '../lib/cache';

describe('getOrSetCache', () => {
  beforeEach(() => {
    __clearCacheForTests();
  });

  test('computes and caches the value on first call', async () => {
    const compute = jest.fn().mockResolvedValue('value-a');
    const result = await getOrSetCache('key-a', 1000, compute);

    expect(result).toBe('value-a');
    expect(compute).toHaveBeenCalledTimes(1);
  });

  test('returns the cached value without recomputing within the TTL', async () => {
    const compute = jest.fn().mockResolvedValue('value-b');

    const first = await getOrSetCache('key-b', 1000, compute);
    const second = await getOrSetCache('key-b', 1000, compute);

    expect(first).toBe('value-b');
    expect(second).toBe('value-b');
    expect(compute).toHaveBeenCalledTimes(1);
  });

  test('recomputes once the TTL has elapsed', async () => {
    jest.useFakeTimers();
    try {
      const compute = jest.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');

      const first = await getOrSetCache('key-c', 1000, compute);
      expect(first).toBe('first');

      jest.advanceTimersByTime(1001);

      const second = await getOrSetCache('key-c', 1000, compute);
      expect(second).toBe('second');
      expect(compute).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  test('tracks distinct keys independently', async () => {
    const computeX = jest.fn().mockResolvedValue('x');
    const computeY = jest.fn().mockResolvedValue('y');

    await getOrSetCache('key-x', 1000, computeX);
    await getOrSetCache('key-y', 1000, computeY);
    await getOrSetCache('key-x', 1000, computeX);

    expect(computeX).toHaveBeenCalledTimes(1);
    expect(computeY).toHaveBeenCalledTimes(1);
  });
});
