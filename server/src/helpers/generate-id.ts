/**
 * Generated id is of the pattern 'AA-000002'
 * Left (partA) is alphabets, and updates before the right(partB) which is numeric
 * The length is not fixed, depending on the category it applies to, '-' is not included in the length count.
 */
export function generateID(lastID: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let [partA, partB] = lastID.split('-');

  for (let i = partA.length - 1; i >= 0; i--) {
    const partAarray = partA.split('');

    // needs to reset partA and increment partB
    if (i == 0 && partA.charAt(i) == alphabet.charAt(alphabet.length - 1)) {
      partA = partAarray.map((char) => alphabet.charAt(0)).join('');

      partB = String(Number.parseInt(partB) + 1).padStart(partB.length, '0');
      break;
    } else {
      // only partA needs to increment
      if (partA.charAt(i) != alphabet.charAt(alphabet.length - 1)) {
        partAarray[i] = alphabet.charAt(alphabet.indexOf(partA.charAt(i)) + 1);
        partA = partAarray.join('');
        break;
      }
    }
  }
  return `${partA}-${partB}`;
}

// console.log(generateNextID('ZZ-000001')); // Output: 'AA-000002'
// console.log(generateNextID('AA-000000')); // Output: 'AB-000000'
