/**
 * Example Test
 * 
 * This is a template for writing tests.
 * To run tests, you'll need to install and configure a testing library.
 * 
 * Recommended setup:
 *   npm install --save-dev jest @types/jest @testing-library/react-native @testing-library/jest-native
 */

// @ts-nocheck - Remove this when you install @types/jest

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should validate string operations', () => {
    const str = 'Hello World';
    expect(str).toContain('Hello');
    expect(str.length).toBe(11);
  });

  // Example component test (uncomment when testing library is set up)
  /*
  import { render, fireEvent } from '@testing-library/react-native';
  import { Button } from '@/components/ui/button';

  it('should handle button press', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press Me</Button>);
    
    fireEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  */
});

// Example validation test
describe('Validation Tests', () => {
  // Uncomment when validation is imported
  /*
  import { emailSchema, passwordSchema } from '@/lib/validation/schemas';

  it('should validate email correctly', () => {
    expect(emailSchema.validate('test@example.com').valid).toBe(true);
    expect(emailSchema.validate('invalid-email').valid).toBe(false);
    expect(emailSchema.validate('').valid).toBe(false);
  });

  it('should validate password correctly', () => {
    expect(passwordSchema.validate('Password123').valid).toBe(true);
    expect(passwordSchema.validate('weak').valid).toBe(false);
    expect(passwordSchema.validate('').valid).toBe(false);
  });
  */
});
