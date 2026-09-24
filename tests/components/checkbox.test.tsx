import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { Checkbox } from '@/components/checkbox';

describe('Checkbox', () => {
  it('renders its label', async () => {
    const { getByText } = await render(
      <Checkbox checked={false} onChange={jest.fn()}>
        I agree to the terms.
      </Checkbox>
    );

    expect(getByText('I agree to the terms.')).toBeTruthy();
  });

  it('reports the opposite of its current state when tapped', async () => {
    const onChange = jest.fn();
    const { getByRole } = await render(<Checkbox checked={false} onChange={onChange} />);

    fireEvent.press(getByRole('checkbox'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('unticks when it was ticked', async () => {
    const onChange = jest.fn();
    const { getByRole } = await render(<Checkbox checked onChange={onChange} />);

    fireEvent.press(getByRole('checkbox'));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('reports its state to assistive technology', async () => {
    const { getByRole } = await render(<Checkbox checked onChange={jest.fn()} />);

    expect(getByRole('checkbox').props.accessibilityState).toMatchObject({ checked: true });
  });

  it('shows an error beneath the box', async () => {
    const { getByText } = await render(
      <Checkbox checked={false} onChange={jest.fn()} error="Please accept the terms." />
    );

    expect(getByText('Please accept the terms.')).toBeTruthy();
  });

  it('refuses to change while disabled', async () => {
    const onChange = jest.fn();
    const { getByRole } = await render(<Checkbox checked={false} onChange={onChange} disabled />);

    fireEvent.press(getByRole('checkbox'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
