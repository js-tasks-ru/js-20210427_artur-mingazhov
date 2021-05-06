/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {

   return function (obj) {

      if (!obj) return
      //if (typeof obj !== 'object') return obj
      if (Object.keys(obj).length === 0) return

      const props = path.split('.')

      for (const prop of props) {
         obj = obj[prop]
      }

      return obj
   }

   /* const props = path.split('.')

   return function f(obj) {

      if (!obj) return
      if (typeof obj !== 'object') return obj
      if (Object.keys(obj).length === 0) return

      if (props.length) {
         return f(obj[props.shift()])
      }

      return obj;
   } */

}
