/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {

   return arr.slice().sort(function (a, b) {
      if (param === 'desc') {
         return b.localeCompare(a, { sensitivity: 'variant' }, { caseFirst: 'upper' })
      }
      else {
         return a.localeCompare(b, { sensitivity: 'variant' }, { caseFirst: 'upper' })
      }
   })
}

