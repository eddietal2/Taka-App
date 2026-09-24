import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { Button } from '@/components/button';

describe('Button', () => {
  it('renders its label', async () => {
    const { getByText } = await render(<Button label="Continue" />);
    expect(getByText('Continue')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<Button label="Save" onPress={onPress} />);

    fireEvent.press(getByText('Save'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('refuses presses while disabled', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<Button label="Save" onPress={onPress} disabled />);

    fireEvent.press(getByText('Save'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('replaces the label with a spinner while loading', async () => {
    const { queryByText } = await render(<Button label="Save" loading />);

    expect(queryByText('Save')).toBeNull();
  });

  it('reports its disabled and busy state to assistive technology', async () => {
    const { getByRole } = await render(<Button label="Save" loading />);

    expect(getByRole('button').props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
  });
});
