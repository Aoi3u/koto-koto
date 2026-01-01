import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { render, act } from '@testing-library/react';
import useTypingEngine from '../features/game/hooks/useTypingEngine';
import { SoundProvider } from '../contexts/SoundContext';

type EngineState = ReturnType<typeof useTypingEngine>;
type HarnessRef = {
  handleInput: (key: string) => { isWordComplete: boolean } | undefined;
  setTarget: EngineState['setTarget'];
  getState: () => EngineState;
};

// Test harness to expose the hook API via ref
const Harness = forwardRef<HarnessRef, { target: string }>((props, ref) => {
  const engine = useTypingEngine();
  const engineRef = useRef(engine);
  engineRef.current = engine;

  useEffect(() => {
    engine.setTarget(props.target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.target]);

  useImperativeHandle(ref, () => ({
    handleInput: engine.handleInput,
    setTarget: engine.setTarget,
    getState: () => engineRef.current,
  }));

  return null;
});

// Add display name to satisfy react/display-name lint rule
Harness.displayName = 'Harness';

describe('useTypingEngine', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('prefix acceptance: partial correct input kept as pending', () => {
    const ref = React.createRef<HarnessRef>();
    render(
      <SoundProvider>
        <Harness target="か" ref={ref} />
      </SoundProvider>
    );

    let r1!: { isWordComplete: boolean } | undefined;
    act(() => {
      r1 = ref.current!.handleInput('k');
    });
    expect(r1).toBeDefined();
    expect(r1!.isWordComplete).toBe(false);
    const s1 = ref.current!.getState();
    expect(s1.pendingInput).toBe('k');
    expect(s1.remainingTarget).toBe('か');
    expect(s1.correctKeyCount).toBe(1); // prefix accepted increments correctKeyCount
  });

  test('state transitions and combos on correct typing', () => {
    const ref = React.createRef<HarnessRef>();
    render(
      <SoundProvider>
        <Harness target="かな" ref={ref} />
      </SoundProvider>
    );

    // Type 'ka'
    act(() => ref.current!.handleInput('k'));
    act(() => ref.current!.handleInput('a'));
    let st = ref.current!.getState();
    expect(st.matchedRomaji).toBe('ka');
    expect(st.matchedKana).toBe('か');
    expect(st.remainingTarget).toBe('な');
    expect(st.pendingInput).toBe('');
    expect(st.currentCombo).toBeGreaterThan(0);
    expect(st.maxCombo).toBeGreaterThan(0);

    // Type 'na'
    act(() => ref.current!.handleInput('n'));
    act(() => ref.current!.handleInput('a'));
    st = ref.current!.getState();
    expect(st.matchedRomaji.endsWith('na')).toBe(true);
    expect(st.matchedKana).toBe('かな');
    expect(st.remainingTarget).toBe('');
  });

  test('isWordComplete becomes true on finishing target', () => {
    const ref = React.createRef<HarnessRef>();
    render(
      <SoundProvider>
        <Harness target="しゅ" ref={ref} />
      </SoundProvider>
    );

    let r!: { isWordComplete: boolean } | undefined;
    act(() => {
      r = ref.current!.handleInput('s');
    });
    expect(r).toBeDefined();
    expect(r!.isWordComplete).toBe(false);
    act(() => {
      r = ref.current!.handleInput('y');
    });
    expect(r).toBeDefined();
    expect(r!.isWordComplete).toBe(false);
    act(() => {
      r = ref.current!.handleInput('u');
    });
    expect(r).toBeDefined();
    expect(r!.isWordComplete).toBe(true);
  });

  test('error increments and shake toggles on wrong key', () => {
    const ref = React.createRef<HarnessRef>();
    render(
      <SoundProvider>
        <Harness target="か" ref={ref} />
      </SoundProvider>
    );

    let r!: { isWordComplete: boolean } | undefined;
    act(() => {
      r = ref.current!.handleInput('x');
    });
    expect(r).toBeDefined();
    expect(r!.isWordComplete).toBe(false);
    const st1 = ref.current!.getState();
    expect(st1.errorCount).toBe(1);
    expect(st1.currentCombo).toBe(0);
    expect(st1.shake).toBe(true);

    // advance timers to clear shake
    act(() => {
      jest.advanceTimersByTime(300);
    });
    const st2 = ref.current!.getState();
    expect(st2.shake).toBe(false);
  });
});
