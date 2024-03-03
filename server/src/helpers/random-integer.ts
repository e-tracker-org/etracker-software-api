export function generateRandomInteger(digits: number = 6) {
  return ('' + Math.random()).substring(2, digits + 2);
}
