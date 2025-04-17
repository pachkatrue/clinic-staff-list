import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock MobX's observer function to simplify testing observed components
vi.mock('mobx-react-lite', () => ({
  observer: (component: any) => component,
}))

// Mock the DatePicker component
vi.mock('react-datepicker', () => {
  const mockDatePicker = ({ onChange, selected }: any) => {
    return React.createElement('input', {
      'data-testid': 'date-picker',
      onChange: (e: any) => onChange(new Date(e.target.value)),
      value: selected ? selected.toISOString().split('T')[0] : ''
    })
  }

  return {
    default: mockDatePicker,
    registerLocale: vi.fn(),
  }
})

// Mock the tooltip component
vi.mock('react-tooltip', () => ({
  Tooltip: () => React.createElement('div', { 'data-testid': 'tooltip' })
}))

// Mock date-fns locale
vi.mock('date-fns/locale/ru', () => ({
  ru: {}
}))