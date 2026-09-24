import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { SegmentedControl } from '@/components/segmented-control';

const OPTIONS = [
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
];

describe('SegmentedControl', () => {
  it('shows every option, so the choice is a tap rather than a menu', async () => {
    const { getByText } = await render(
      <SegmentedControl options={OPTIONS} value="light" onChange={jest.fn()} />
    );

    expect(getByText('Light')).toBeTruthy();
    expect(getByText('Dark')).toBeTruthy();
  });

  it('marks the selected option only', async () => {
    const { getAllByRole } = await render(
      <SegmentedControl options={OPTIONS} value="dark" onChange={jest.fn()} />
    );

    const radios = getAllByRole('radio');
    expect(radios[0].props.accessibilityState).toMatchObject({ selected: false });
    expect(radios[1].props.accessibilityState).toMatchObject({ selected: true });
  });

  it('reports the value that was tapped', async () => {
    const onChange = jest.fn();
    const { getByText } = await render(
      <SegmentedControl options={OPTIONS} value="light" onChange={onChange} />
    );

    fireEvent.press(getByText('Dark'));

    expect(onChange).toHaveBeenCalledWith('dark');
  });

  it('exposes the group to assistive technology', async () => {
    const { getByLabelText } = await render(
      <SegmentedControl
        options={OPTIONS}
        value="light"
        onChange={jest.fn()}
        accessibilityLabel="Appearance"
      />
    );

    expect(getByLabelText('Appearance')).toBeTruthy();
  });
});
