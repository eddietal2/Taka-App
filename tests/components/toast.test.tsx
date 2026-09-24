import { describe, expect, it, jest } from '@jest/globals';
import { render, waitFor } from '@testing-library/react-native';

import { Toast } from '@/components/toast';

describe('Toast', () => {
  it('announces its message politely', async () => {
    const { getByText } = await render(
      <Toast message="Successfully logged out" onDismiss={jest.fn()} />
    );

    const message = getByText('Successfully logged out');
    expect(message).toBeTruthy();
    // Asserted on the banner around the text, since React Native's role set has
    // no "alert" mapping for `getByRole` to match on.
    expect(message.parent?.props.accessibilityRole).toBe('alert');
    expect(message.parent?.props.accessibilityLiveRegion).toBe('polite');
  });

  it('dismisses itself once its time is up', async () => {
    const onDismiss = jest.fn();
    await render(<Toast message="Saved" duration={10} onDismiss={onDismiss} />);

    await waitFor(() => expect(onDismiss).toHaveBeenCalledTimes(1));
  });

  it('stays put until the duration has passed', async () => {
    const onDismiss = jest.fn();
    await render(<Toast message="Saved" duration={100000} onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
