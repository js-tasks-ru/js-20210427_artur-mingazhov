export default class SortableTable {

  subElements = {};

  constructor(headerConfig = [], { data = [] } = {}) {
    this.header = headerConfig;
    this.localData = data.map(item => {
      return this.header.reduce((acum, { id }) => {
        acum['id'] = item['id'];
        acum[id] = item[id];

        return acum
      }, {})
    });
    //this.localData = [...data];
    this.render();

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

    let result = '';

    for (const { id, title, sortable } of this.header) {

      result += ` 
      <div class="sortable-table__cell" data-id=${[id]} data-sortable=${[sortable]} data-order="">
        <span>${[title]}</span>
      </div>`
    }

    return result;
  }

  get bodyItems() {

    let result = '';

    for (const item of this.localData) {

      let body = '';

      for (const { id, template = null } of this.header) {
        if (template)
          body += template(item[id]);
        else
          body += `<div class="sortable-table__cell">${item[id]}</div>`
      }

      result += ` 
      <a href="/products/${item['id']}" class="sortable-table__row">
        ${body}
      </a>
      `
    }

    return result;
  }

  render() {

    let element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {

    const elements = element.querySelectorAll('[data-element]');

    const result = {};

    for (const item of [...elements]) {

      result[item.dataset.element] = item
    }

    return result

  }

  sort(fieldValue, orderValue) {

    const header = this.header.find(item => item.id === fieldValue);
    if (!header.sortable) return;

    for (const child of this.subElements.header.children) {
      if (child.dataset.id === header.id) {
        child.dataset.order = orderValue;
      } else {
        child.dataset.order = "";
      }
    }

    const order = orderValue == "asc" ? 1 : -1;
    const compare = {
      "number": (a, b) => a - b,
      "string": (a, b) => a.localeCompare(b, { sensitivity: 'variant' }, { caseFirst: 'upper' }),
    }[header.sortType];

    this.localData.sort((a, b) => order * compare(a[fieldValue], b[fieldValue]));

    this.subElements.body.innerHTML = this.bodyItems;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

