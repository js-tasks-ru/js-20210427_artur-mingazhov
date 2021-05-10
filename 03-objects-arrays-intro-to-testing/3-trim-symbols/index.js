/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {

   const arr = string.split('');

   let seqsArr = []

   for (let i = 0; i < arr.length; i++) {

      let seq = [arr[i]];

      while (arr[++i] === seq[0]) { // i выходит за размеры массива, это безопасно в js???
         seq.push(arr[i]);
      }
      i--;
      seqsArr.push(seq);
   }

   seqsArr.forEach(item => {
      if (item.length > size) {
         item.length = size;
      }
   })

   return seqsArr.map(item => item.join('')).join('');
}
