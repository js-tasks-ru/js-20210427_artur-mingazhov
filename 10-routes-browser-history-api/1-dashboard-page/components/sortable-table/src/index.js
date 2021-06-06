import fetchJson from '../../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  numberOfNewItems = 30;

  onSortByClick = (event) => {

    const target = event.target.closest('[data-id]');

    if (!target)
      return

    if (target.dataset.sortable === 'false')
      return

    const id = target.dataset.id;

    let order;

    switch (target.dataset.order) {
      case 'asc':
        order = 'desc'
        break;
      case 'desc':
        order = 'asc'
        break;
      default:
        order = 'desc'
    }

    this.addArrowToHeader(id, order);
    this.sort(id, order)

  }

  onScrolledBottom = () => {

    if (this.isSortLocally)
      return

    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );

    const hasScrolledBottom = scrollHeight - window.pageYOffset === document.documentElement.clientHeight;
    if (hasScrolledBottom) {

      this.loadData(this.sorted.id, this.sorted.order)
    }

  }

  constructor(header, {
    url = '',
    data = [],
    sorted = {
      id: header.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false
  } = {}) {

    this.url = new URL(url, BACKEND_URL);
    this.header = header;
    this._data = data;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.start = 0;
    this.end = 0;

    this.render();
  }

  get data() {

    return this._data;
  }

  set data(newData) {

    if (newData.length === 0) {

      this.element.querySelector('.sortable-table').classList.add('sortable-table_empty')

    }

    this.subElements.loading.classList.remove('sortable-table__loading-line')

    this.subElements.body.innerHTML += this.getBodyItems(newData);

    return this._data = [...this._data, ...newData]
  }

  render() {

    let element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.addEventListeners();

    return this.loadData().then(() => {

      this.addArrowToHeader(this.sorted.id, this.sorted.order)

    })

  }

  get template() {
    return `
    <div data-element="productsContainer" class="products-list__container">
       <div class="sortable-table sortable-table_loading ">
          <div data-element="header" class="sortable-table__header sortable-table__row">
             ${this.headerItems}
          </div>
          <div data-element="body" class="sortable-table__body">
             ${this.getBodyItems(this.data)}
          </div>
           <div data-element="loading" class="loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
             <div>
                <p>No products satisfies your filter criteria</p>
                <button type="button" class="button-primary-outline">Reset all filters</button>
              </div>
          </div>
        </div>
     </div>
   `
  }

  get headerItems() {

    return this.header.map(({ id, title, sortable }) =>

      `<div class="sortable-table__cell" data-id=${[id]} data-sortable=${[sortable]} data-order="">
        <span>${[title]}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`

    ).join('');

  }

  getBodyItems(bodyItems) {


    return bodyItems.map(item => {

      const body = this.header.map(({ id, template = null }) =>

        template ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`

      ).join('');

      return ` 
      <a href="/products/${item['id']}" class="sortable-table__row">
        ${body}
      </a>
      `
    }).join('')
  }

  loadData(id = this.sorted.id, order = this.sorted.order) {

    this.start = this._data.length;
    this.end = this._data.length + this.numberOfNewItems;


    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', this.start);
    this.url.searchParams.set('_end', this.end);


    this.subElements.loading.classList.add('sortable-table__loading-line')


    return fetchJson(this.url.toString())
      .then((newData) => this.data = newData)
  }

  getSubElements(element) {

    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, item) => {
      result[item.dataset.element] = item;
      return result;
    }, {})
  }

  sort(id, order) {

    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  sortOnClient(id, order) {

    const header = this.header.find(item => item.id === id);

    const ord = order == "asc" ? 1 : -1;

    const compare = {
      "number": (a, b) => a - b,
      "string": (a, b) => a.localeCompare(b, { sensitivity: 'variant' }, { caseFirst: 'upper' }),
      "custom": (a, b) => customSorting(a, b),
    }[header.sortType];

    this.data.sort((a, b) => ord * compare(a[id], b[id]));

    this.subElements.body.innerHTML = this.getBodyItems(this.data);
  }

  sortOnServer(id, order) {

    this.sorted = { id, order };

    const start = 0;
    const end = this.numberOfNewItems;

    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    fetchJson(this.url.toString())
      .then((newData) => {
        this._data = newData;
        this.subElements.body.innerHTML = this.getBodyItems(newData);
      })
  }

  addArrowToHeader(id = this.sorted.id, order = this.sorted.order) {

    const header = this.header.find(item => item.id === id);

    for (const child of this.subElements.header.children) {
      if (child.dataset.id === header.id) {
        child.dataset.order = order;
      } else {
        child.dataset.order = "";
      }
    }
  }

  updataBodyItems(data) {
    this.data = data;

    this.subElements.body.innerHTML = this.getBodyItems(data);
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortByClick)
    window.addEventListener('scroll', this.onScrolledBottom)
  }

  removeEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.onSortByClick)
    window.removeEventListener('scroll', this.onScrolledBottom)
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.removeEventListeners()
  }
}
