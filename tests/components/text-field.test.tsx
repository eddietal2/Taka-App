import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { TextField } from '@/components/text-field';

describe('TextField', () => {
  it('renders its label and current value', async () => {
    const { getByText, getByDisplayValue } = await render(
      <TextField label="Phone number" value="712345678" onChangeText={jest.fn()} />
    );

    expect(getByText('Phone number')).toBeTruthy();
    expect(getByDisplayValue('712345678')).toBeTruthy();
  });

  it('reports what the user types', async () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = await render(
      <TextField label="Phone number" value="" onChangeText={onChangeText} />
    );

    fireEvent.changeText(getByLabelText('Phone number'), '0712');

    expect(onChangeText).toHaveBeenCalledWith('0712');
  });

  it('renders a static prefix inside the field', async () => {
    const { getByText } = await render(
      <TextField label="Phone number" prefix="+255" value="" onChangeText={jest.fn()} />
    );

    expect(getByText('+255')).toBeTruthy();
  });

  it('shows an error in place of the hint', async () => {
    const { getByText, queryByText } = await render(
      <TextField
        label="Phone number"
        hint="You can also start with 0."
        error="Enter a valid Tanzanian mobile number."
        value=""
        onChangeText={jest.fn()}
      />
    );

    expect(getByText('Enter a valid Tanzanian mobile number.')).toBeTruthy();
    expect(queryByText('You can also start with 0.')).toBeNull();
  });

  it('shows the hint when there is no error', async () => {
    const { getByText } = await render(
      <TextField label="Ward" hint="Optional." value="" onChangeText={jest.fn()} />
    );

    expect(getByText('Optional.')).toBeTruthy();
  });

  it('toggles a password between hidden and shown', async () => {
    const { getByLabelText, getByText } = await render(
      <TextField label="Password" password value="secret" onChangeText={jest.fn()} />
    );

    // The toggle names what it will do next, so the label flips with the state.
    // The press is awaited because it triggers a re-render.
    await fireEvent.press(getByText('Show'));
    expect(getByLabelText('Hide password')).toBeTruthy();

    await fireEvent.press(getByText('Hide'));
    expect(getByLabelText('Show password')).toBeTruthy();
  });
});
