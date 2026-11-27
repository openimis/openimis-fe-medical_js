/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from '@openimis/fe-core/testing';
import MedicalItemChildPanel from './MedicalItemChildPanel';
import MedicalServiceChildPanel from './MedicalServiceChildPanel';

// The fe-core barrel cannot be loaded from a test: stub only the exports this panel reaches.
// The picker reports its value and offers a button that picks a priced entry.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  const { mockModulesManager, injectIntl } = await import('@openimis/fe-core/testing');
  const h = ReactActual.createElement;
  return {
    injectIntl,
    withModulesManager: (C) => (props) => h(C, { modulesManager: mockModulesManager(), ...props }),
    formatMessage: (intl, module, id) => `${module}.${id}`,
    PublishedComponent: ({ value, onChange }) => h('button', {
      type: 'button',
      onClick: () => onChange({ code: 'NEW', price: 7 }),
    }, `picked:${value?.code ?? ''}`),
    NumberInput: ({ value }) => h('span', null, `qty:${value ?? ''}`),
    AmountInput: ({ value }) => h('span', null, `price:${value ?? ''}`),
    Table: ({
      header, headers, items, itemFormatters,
    }) => h('div', null, [
      h('h2', { key: 'h' }, header),
      h('p', { key: 'hs' }, headers.join('|')),
      ...items.map((item, idx) => h('div', { key: idx, 'data-testid': 'line' }, itemFormatters.map((f, k) => h(ReactActual.Fragment, { key: k }, f(item, idx))))),
    ]),
  };
});

const renderPanel = (Panel, { packagetype = 'P', edited, onEditedChanged = vi.fn() }) => {
  renderWithProviders(
    <Panel
      type="item"
      picker="medical.ItemPicker"
      edited={edited}
      medicalService={{ packagetype }}
      onEditedChanged={onEditedChanged}
    />,
  );
  return onEditedChanged;
};

describe('MedicalChildPanel', () => {
  it('lists the items of a package, plus an empty line to add one', () => {
    renderPanel(MedicalItemChildPanel, {
      edited: { servicesLinked: [{ item: { code: 'I1' }, qtyProvided: 2, priceAsked: 5 }] },
    });

    expect(screen.getByText('claim.edit.items.title')).toBeInTheDocument();
    expect(screen.getByText('edit.items.item|edit.items.quantity|edit.items.price')).toBeInTheDocument();
    expect(screen.getAllByTestId('line')).toHaveLength(2);
    expect(screen.getByText('picked:I1')).toBeInTheDocument();
  });

  it('heads the price column as a ceiling for a fixed-price package', () => {
    renderPanel(MedicalItemChildPanel, { packagetype: 'F', edited: {} });

    expect(screen.getByText('edit.items.item|edit.items.quantity|edit.items.ceiling')).toBeInTheDocument();
  });

  it('shows nothing for a package type without content', () => {
    renderPanel(MedicalItemChildPanel, { packagetype: 'S', edited: {} });

    expect(screen.queryByText('claim.edit.items.title')).not.toBeInTheDocument();
  });

  it('prices a picked service and stores it on the service lines', async () => {
    const onEditedChanged = renderPanel(MedicalServiceChildPanel, {
      edited: { code: 'S1', serviceserviceSet: [{ service: { code: 'OLD' } }] },
    });

    await userEvent.setup().click(screen.getByText('picked:OLD'));

    const edited = onEditedChanged.mock.calls.at(-1)[0];
    expect(edited.code).toBe('S1');
    expect(edited.serviceserviceSet[0]).toMatchObject({ item: { code: 'NEW', price: 7 }, priceAsked: 7, qtyProvided: 1 });
    expect(edited.servicesLinked).toBeUndefined();
  });
});
