import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResultScreen from '../features/result/components/ResultScreen';
import { SeasonalProvider } from '../contexts/SeasonalContext';
import ToastProvider from '../components/ToastProvider';

const renderResultScreen = () =>
  render(
    <SeasonalProvider>
      <ToastProvider>
        <ResultScreen
          correctKeyCount={250}
          errorCount={0}
          maxCombo={42}
          duration={30}
          onRestart={jest.fn()}
        />
      </ToastProvider>
    </SeasonalProvider>
  );

describe('ResultScreen share button', () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
    jest.restoreAllMocks();
  });

  test('copies the result text and shows a success toast, not a blocking alert', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    });
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    renderResultScreen();
    fireEvent.click(screen.getByText('Share'));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain('Koto-Koto Evaluation Result');

    expect(await screen.findByText('Result copied to clipboard!')).toBeInTheDocument();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  test('shows an error toast when the clipboard write fails', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    });

    renderResultScreen();
    fireEvent.click(screen.getByText('Share'));

    expect(await screen.findByText('Failed to copy result to clipboard.')).toBeInTheDocument();
  });

  test('shows an error toast when the Clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    renderResultScreen();
    fireEvent.click(screen.getByText('Share'));

    expect(
      await screen.findByText('Clipboard is not available in this browser.')
    ).toBeInTheDocument();
  });
});
