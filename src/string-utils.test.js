import { reverse } from './string-utils';

test('reverse "abc" returns "cba"', () => {
  expect(reverse('abc')).toBe('cba');
});

test('reverse "" returns ""', () => {
  expect(reverse('')).toBe('');
});

test('reverse(null) throws an error', () => {
  expect(() => reverse(null)).toThrow('Input must be a string');
});

import { truncate } from './string-utils';

test('truncate("hello world", 5) returns "hello..."', () => {
  expect(truncate('hello world', 5)).toBe('hello...');
});
