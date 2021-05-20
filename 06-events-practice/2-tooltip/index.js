export default class Tooltip {

   static #onlyInstance = null;

   onPointerOver = (event) => {

      const target = event.target.closest('[data-tooltip]');

      if (!target) {
         return
      }

      this.render(target.dataset.tooltip);

      target.addEventListener('pointermove', this.onPointerMove)
   }

   onPointerOut = () => {
      this.remove()
   }

   onPointerMove = (event) => {

      this.element.style.left = event.clientX + 10 + 'px';

      this.element.style.top = event.clientY + 10 + 'px';
   }

   constructor() {
      if (!Tooltip.#onlyInstance) {
         Tooltip.#onlyInstance = this;
      } else {
         return Tooltip.#onlyInstance;
      }
   }

   render(elementText) {

      const element = document.createElement('div');

      element.innerHTML = `<div class="tooltip">${elementText}</div>`

      this.element = element.firstElementChild

      document.body.append(this.element)
   }

   initialize() {

      document.body.addEventListener('pointerover', this.onPointerOver)

      document.body.addEventListener('pointerout', this.onPointerOut)
   }

   remove() {
      if (this.element)
         this.element.remove()
      //this.element = null
   }

   destroy() {
      this.remove();
      document.body.removeEventListener('pointerover', this.onPointerOver)
      document.body.removeEventListener('pointerout', this.onPointerOut)
      document.body.removeEventListener('pointermove', this.onPointerMove)
   }
}


