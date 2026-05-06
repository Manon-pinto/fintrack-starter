export function truncate(input, length) {
  if (typeof input !== 'string') throw new Error('Input must be a string');
  if (input.length <= length) return input;
  return input.slice(0, length) + '...';
}

export function reverse(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  return input.split('').reverse().join('');
}
