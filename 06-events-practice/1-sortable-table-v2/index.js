export default class SortableTable {

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

    this.sort({ id, order })

  }

  constructor(headersConfig, {
    data = [],
    sorted = {
      id: this.header.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = true
  } = {}) {

    this.header = headersConfig;
    this.localData = [...data];
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;

    this.render();
    this.addEventListeners()
    this.sort()

  }

  render() {

    let element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild

    this.subElements = this.getSubElements(this.element);
  }

  get template() {
    return `
    <div data-element="productsContainer" class="products-list__container">
       <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
             ${this.headerItems}
          </div>
          <div data-element="body" class="sortable-table__body">
             ${this.bodyItems}
          </div>
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

  get bodyItems() {

    return this.localData.map(item => {

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


  getSubElements(element) {

    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, item) => {
      result[item.dataset.element] = item;
      return result;
    }, {})
  }

  sort(params = this.sorted) {

    if (this.isSortLocally) {
      this.sortOnClient(params);
    } else {
      this.sortOnServer(params);
    }
  }

  sortOnClient({ id, order }) {

    const header = this.header.find(item => item.id === id);
    if (!header.sortable) return;

    for (const child of this.subElements.header.children) {
      if (child.dataset.id === header.id) {
        child.dataset.order = order;
      } else {
        child.dataset.order = "";
      }
    }

    const ord = order == "asc" ? 1 : -1;

    const compare = {
      "number": (a, b) => a - b,
      "string": (a, b) => a.localeCompare(b, { sensitivity: 'variant' }, { caseFirst: 'upper' }),
      "custom": (a, b) => customSorting(a, b),
    }[header.sortType];

    this.localData.sort((a, b) => ord * compare(a[id], b[id]));

    this.subElements.body.innerHTML = this.bodyItems;
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortByClick)
  }

  removeEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.onSortByClick)
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
