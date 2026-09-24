import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { StepHeader } from '@/components/step-header';
import { I18nProvider } from '@/features/i18n/context';

/** The header reads its counter and back label from the translator. */
function wrap(children: ReactNode) {
  return <I18nProvider>{children}</I18nProvider>;
}

describe('StepHeader', () => {
  it('renders the title and subtitle', async () => {
    const { getByText } = await render(
      wrap(<StepHeader title="Your details" subtitle="Tell us who you are." step={2} totalSteps={8} />)
    );

    expect(getByText('Your details')).toBeTruthy();
    expect(getByText('Tell us who you are.')).toBeTruthy();
  });

  it('counts the position in the flow', async () => {
    // The default language is Kiswahili, so the counter reads in it.
    const { getByText } = await render(wrap(<StepHeader title="Step" step={2} totalSteps={8} />));

    expect(getByText('HATUA 2 YA 8')).toBeTruthy();
  });

  it('offers a back affordance when asked for one', async () => {
    const onBack = jest.fn();
    const { getByText } = await render(wrap(<StepHeader title="Step" step={1} totalSteps={3} onBack={onBack} />));

    fireEvent.press(getByText('Rudi'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('has no back affordance without a handler', async () => {
    const { queryByText } = await render(wrap(<StepHeader title="Step" step={1} totalSteps={3} />));

    expect(queryByText('Rudi')).toBeNull();
  });
});
