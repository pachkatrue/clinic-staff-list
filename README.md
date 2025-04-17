# Список сотрудников клиники - Unit Tests

This project implements unit tests for the "Список сотрудников клиники" React application. The tests are written using Jest and React Testing Library.

## Test Implementation

The following components have been tested:

1. **UserForm.test.tsx** - Tests for the UserForm component, which handles:
   - Form initialization with default or provided values
   - Form validation
   - Form submission
   - Input changes handling

2. **UsersTable.test.tsx** - Tests for the UsersTable component, which handles:
   - Rendering user data in a table format
   - Sorting functionality
   - Action buttons (details, edit, delete)
   - Loading and error states
   - Pagination

3. **SearchBar.test.tsx** - Tests for the SearchBar component, which handles:
   - Rendering search input and button
   - Updating input value
   - Form submission
   - Responding to prop changes

## Running the Tests

To run the tests, use the following commands:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Configuration

The test environment is set up with:

- **Jest** - Testing framework
- **React Testing Library** - For testing React components
- **User Event** - For simulating user interactions
- **Jest DOM** - For DOM testing utilities

Configuration files:
- `jest.config.js` - Jest configuration
- `setupTests.ts` - Test setup and global mocks

## Mock Implementation

Several parts of the application are mocked to isolate component testing:

1. **MobX observer** - Simplified to allow testing without MobX store dependencies
2. **DatePicker** - Replaced with a simple input for easier testing
3. **Tooltip** - Simplified implementation for UI testing

## Notes on Testing Strategy

The tests focus on:

1. **Functional correctness** - Ensuring components behave as expected
2. **User interactions** - Testing user input and component responses
3. **Edge cases** - Testing validation, loading states, and error handling
4. **Integration points** - Making sure components interact correctly with props and callbacks

The test coverage aims to verify that all critical functionality works correctly while providing examples of different testing approaches.
