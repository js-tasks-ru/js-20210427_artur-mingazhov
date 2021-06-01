export default class SortableList {

   onMoveElem = (event) => {
      event.preventDefault();
      const target = event.target.closest('[data-grab-handle]');

      if (target) {

         this.movingItem = event.target.closest('.sortable-list__item');

         const hightOfMovingItem = this.movingItem.offsetHeight;
         const widthOfMovingItem = this.movingItem.offsetWidth;
         this.shiftX = event.clientX - this.movingItem.getBoundingClientRect().left;
         this.shiftY = event.clientY - this.movingItem.getBoundingClientRect().top;

         this.movingItem.classList.add('sortable-list__item_dragging')

         this.movingItem.style.height = hightOfMovingItem + 'px'
         this.movingItem.style.width = widthOfMovingItem + 'px'

         this.placeholder = this.getPlaceholder(widthOfMovingItem, hightOfMovingItem);

         this.movingItem.after(this.placeholder)

         this.movingItem.parentNode.append(this.movingItem)

         this.moveAt(event);

         document.addEventListener('pointermove', this.onMouseMove);

         document.addEventListener('pointerup', this.onPointerUp);
      }
   }

   onPointerUp = () => {

      this.placeholder.replaceWith(this.movingItem)

      this.movingItem.style.left = 'auto';
      this.movingItem.style.top = 'auto';

      this.movingItem.classList.remove('sortable-list__item_dragging')

      document.removeEventListener('pointermove', this.onMouseMove);
   }

   onMouseMove = (event) => {

      this.moveAt(event);

      this.movingItem.classList.add('hide');

      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);

      this.movingItem.classList.remove('hide')

      const droppableBelow = elemBelow.closest('.sortable-list__item');

      if (droppableBelow) {

         if (droppableBelow.nextSibling && droppableBelow.nextSibling.closest('.sortable-list__placeholder')) {

            droppableBelow.before(this.placeholder)
         } else {

            droppableBelow.after(this.placeholder)
         }
      }
   }

   moveAt = (event) => {

      this.movingItem.style.left = event.clientX - this.shiftX + 'px';
      this.movingItem.style.top = event.clientY - this.shiftY + 'px';
   }

   onRemoveItemByClick = (event) => {

      const target = event.target.closest('[data-delete-handle]')

      if (target) {

         const el = target.closest('.sortable-list__item');

         this.dispatchEvent(el);

         target.closest('.sortable-list__item').remove()

      }
   }

   constructor({ items = [] } = {}) {

      this.items = items

      this.render()
      this.initEventListeners()
   }

   render() {

      const element = document.createElement('ul');

      element.classList.add('sortable-list');

      this.element = element;

      for (const item of this.items) {

         item.classList.add('sortable-list__item');

         this.element.append(item)
      }

   }
   getPlaceholder(width, height) {

      const placeholder = document.createElement('li');

      placeholder.classList.add('sortable-list__placeholder')

      placeholder.style.width = width + 'px'
      placeholder.style.height = height + 'px'

      return placeholder;
   }

   dispatchEvent(item) {

      const event = new CustomEvent("remove-item", { detail: item });
      this.element.dispatchEvent(event);
   }

   initEventListeners() {
      this.element.addEventListener('pointerdown', this.onMoveElem)
      this.element.addEventListener('pointerdown', this.onRemoveItemByClick)

   }
   removeEventListeners() {
      this.element.removeEventListener('pointerdown', this.onMouseDown);
      this.element.removeEventListener('pointerdown', this.onRemoveItemByClick);
      document.removeEventListener('pointermove', this.onMouseMove);
      document.removeEventListener('pointerup', this.onPointerUp);
   }

   remove() {
      this.element.remove();
   }

   destroy() {
      this.removeEventListeners();
      this.remove();
   }

}
