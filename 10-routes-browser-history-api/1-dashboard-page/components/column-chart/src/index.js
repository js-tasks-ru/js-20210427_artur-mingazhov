import fetchJson from '../../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
   chartHeight = 50;

   constructor({
      url = '',
      range = {
         from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
         to: new Date()
      },
      label = '',
      data = [],
      value = 0,
      link = '',
      formatHeading
   } = {}) {

      this.url = url;
      this.from = range.from;
      this.to = range.to;
      this.label = label;
      this._data = data;
      this.value = value;
      this.link = link;
      this.formatHeading = formatHeading;

      this.render();
      this.update(range.from, range.to);
   }

   set data(newData) {

      const newValues = Object.values(newData);

      if (newValues.length) {
         this.element.classList.remove('column-chart_loading')
      }

      this.value = newValues.reduce((sum, value) => sum + value, 0);


      this.subElements.header.innerHTML = this.getHeading(this.value)
      this.subElements.body.innerHTML = this.getChartColumns(newValues);

      return this._data = newData;
   }

   get data() {
      return this._data;
   }

   getChartColumns(arr) {

      const maxColHeight = Math.max(...arr);

      return arr.map(colHeight =>
         `<div style="--value: ${Math.floor(this.chartHeight / maxColHeight * colHeight)}"
                    data-tooltip=${((colHeight * 100) / maxColHeight).toFixed() + '%'}></div>`
      ).join('');

   }

   isLoading() {

      return !this.data.length
   }

   get template() {
      return `
       <div class="column-chart column-chart_loading" style="--chart-height: 50">
      <div class="column-chart__title">
        Total  ${this.label}
        <a href="/sales" class="column-chart__link">View all</a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
           ${this.getHeading(this.value)}
        </div>
        <div data-element="body" class="column-chart__chart">
           ${this.getChartColumns(this.data)}
        </div >
      </div >
    </div >
   `
   }

   getHeading(value) {

      return this.formatHeading ? this.formatHeading(value) : value;
   }

   render() {

      const element = document.createElement('div'); // (*)

      element.innerHTML = this.template;

      this.element = element.firstElementChild;

      this.subElements = this.getSubElements(this.element);
   }

   getSubElements(element) {

      const elements = element.querySelectorAll('[data-element]');

      return [...elements].reduce((result, item) => {
         result[item.dataset.element] = item;
         return result;
      }, {})
   }

   update(f, t) {

      const from = this.toFormatDate(f);
      const to = this.toFormatDate(t);

      return fetchJson(`${BACKEND_URL}/${this.url}?from=${from}T12%3A16%3A59.193Z&to=${to}T12%3A16%3A59.193Z`)
         .then((newData) => this.data = newData)

   }

   toFormatDate(rawDate) {

      return rawDate.toISOString().split('T')[0];
   }

   remove() {
      if (this.element) {
         this.element.remove();
      }
   }

   destroy() {
      this.remove();
      this.element = null;
      this.subElements = {};
   }
}
