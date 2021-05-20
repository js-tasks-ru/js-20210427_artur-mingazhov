
export default class ColumnChart {
   chartHeight = 50;

   constructor({ label = '', data = [], value = '', link = '', formatHeading } = {}) {
      this.data = data;
      this.label = label;
      this.value = value;
      this.link = link;
      this.formatHeading = formatHeading;
      this.render();
   }

   getChartColumns(arr) {
      let result = ''
      const maxColHeight = Math.max(...arr);

      for (const colHeight of arr) {
         result += `<div style="--value: ${Math.floor(this.chartHeight / maxColHeight * colHeight)}"
                    data-tooltip=${((colHeight * 100) / maxColHeight).toFixed() + '%'}></div>`
      }
      return result;
   }
   isLoading() {

      return !this.data.length
   }
   render() {
      const element = document.createElement('div'); // (*)

      element.innerHTML = `
       <div class="column-chart ${this.isLoading() ? 'column-chart_loading' : ''}" style="--chart-height: 50">
      <div class="column-chart__title">
        Total  ${this.label}
        <a href="/sales" class="column-chart__link">View all</a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
           ${this.formatHeading ? this.formatHeading(this.value) : this.value}
        </div>
        <div data-element="body" class="column-chart__chart">
           ${this.getChartColumns(this.data)}
        </div >
      </div >
    </div >
   `;

      // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
      // который мы создали на строке (*)
      this.element = element.firstElementChild;
   }
   update(newData) {
      const newChartColumns = this.element.querySelector('.column-chart__chart');

      if (newData.length) {
         this.element.classList.remove('column-chart_loading')
      }
      else {
         this.element.classList.add('column-chart_loading')
      }

      newChartColumns.innerHTML = this.getChartColumns(newData);

   }

   remove() {
      this.element.remove();
   }

   destroy() {
      this.remove();
      // NOTE: удаляем обработчики событий, если они есть
   }


}
