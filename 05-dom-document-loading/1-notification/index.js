export default class NotificationMessage {

   static isActive = false;

   constructor(message = '', { duration = 1000, type = "success" } = {}) {

      this.message = message;
      this.duration = duration;
      this.type = type;
      this.render();
   }

   get template() {
      return `
        <div class="notification ${this.type}" style="--value:${this.duration / 1000 + 's'}">
          <div class="timer"></div>
          <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">
              ${this.message}
            </div>
          </div>
       </div>
       `
   }
   render() {

      const element = document.createElement('div');

      element.innerHTML = this.template;

      this.element = element.firstElementChild
   }

   show(elem = document.body) {

      if (NotificationMessage.isActive) {

         document.querySelector('.notification').remove();
         this.destroy()
      }

      NotificationMessage.isActive = true;

      setTimeout(() => {

         NotificationMessage.isActive = false
         this.destroy()
      }, this.duration)

      elem.append(this.element);
   }

   remove() {

      this.element.remove();
   }

   destroy() {

      this.remove();
   }
}
