import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { OptionCard } from '@/components/option-card';

describe('OptionCard', () => {
  it('renders a title and description', async () => {
    const { getByText } = await render(
      <OptionCard title="Resident" description="A household using Taka." />
    );

    expect(getByText('Resident')).toBeTruthy();
    expect(getByText('A household using Taka.')).toBeTruthy();
  });

  it('reports selection to assistive technology', async () => {
    const { getByRole } = await render(<OptionCard title="Resident" selected />);

    expect(getByRole('radio').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('calls onPress when chosen', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<OptionCard title="Reporter" onPress={onPress} />);

    fireEvent.press(getByText('Reporter'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('refuses to be chosen while disabled', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <OptionCard title="Reporter" onPress={onPress} disabled />
    );

    fireEvent.press(getByText('Reporter'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
