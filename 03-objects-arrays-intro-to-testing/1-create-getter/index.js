/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {

   const props = path.split('.')

   return function (obj) {

      for (const prop of props) {

         if (obj)
            obj = obj[prop]
         else return
      }

      return obj
   }
}

//======================================

/* export function createGetter(path) {

   const props = path.split('.')

   return function f(obj, prop = 0) {

      if (obj && prop < props.length) {

         return f(obj[props[prop]], ++prop)
      }

      return obj;
   }
} */

//=============================================

/* export function createGetter(path) {

   const props = path.split('.')

   let prop = 0;

   return function f(obj) {

      if (obj && prop < props.length) {

         return f(obj[props[prop++]])
      }

      prop = 0;
      return obj;
   }
} */