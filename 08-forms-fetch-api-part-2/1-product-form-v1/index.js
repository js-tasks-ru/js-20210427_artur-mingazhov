import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';


export default class ProductForm {

  onRemoveImage = (event) => {

    const target = event.target.closest('[data-delete-handle]');

    if (target) {

      const currentImage = target.closest('li').querySelector('input').value;
      this.productData.images = this.productData.images.filter(image => image.url !== currentImage)
      target.closest('li').remove();

    }
  }

  onEditForm = (event) => {

    if (event.target.id === 'price' || event.target.id === 'quantity' ||
      event.target.id === 'discount' || event.target.id === 'status') {

      this.productData[event.target.id] = Number(event.target.value);
    }
    else {
      this.productData[event.target.id] = event.target.value;
    }

  }

  onSubmit = (event) => {

    event.preventDefault();
    this.save();
  }

  constructor(productId) {

    this.productId = productId;
    this.productData = {
      title: '',
      description: '',
      quantity: '',
      subcategory: '',
      status: '',
      images: [],
      price: '',
      discount: ''
    };
    this.categoriesData = [];

  }

  async render() {

    if (this.productId) {

      const [categoriesData, [productResponse]] = await Promise.all([

        fetchJson(`https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory`),
        fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`),
      ])

      this.categoriesData = categoriesData;
      this.productData = productResponse

    } else {

      this.categoriesData = await fetchJson(`https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory`);

    }

    let element = document.createElement('div');

    element.innerHTML = this.template();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(element);

    this.getСategories();

    this.addEventListeners()

    return this.element;
  }

  getImages() {
    return this.productData.images.map(({ source, url }) =>
      `<li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${url}">
          <input type="hidden" name="source" value="${source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${url}">
            <span>${source}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>`).join('')
  }

  getSubElements(element) {

    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, item) => {
      result[item.dataset.element] = item;
      return result;
    }, {})
  }

  getСategories() {

    for (const { title, subcategories } of this.categoriesData) {

      for (const { id: value, title: subtitle } of subcategories) {

        const newOption = new Option(`${title} > ${subtitle}`, value, false, this.productData.subcategory === value);

        this.subElements.productCategory.add(newOption);
      }
    }
  }
  async save() {

    const response = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(this.productData)
    });

    this.dispatchEvent(response);
  }

  dispatchEvent(product) {

    const event = this.productId
      ? new CustomEvent("product-updated", { detail: product.id })
      : new CustomEvent("product-saved", { detail: product });

    this.element.dispatchEvent(event);
  }

  addEventListeners() {

    this.subElements.imageListContainer.addEventListener('pointerdown', this.onRemoveImage);
    this.subElements.productForm.addEventListener('change', this.onEditForm);
    this.subElements.productForm.addEventListener('submit', this.onSubmit)
  }

  template() {

    return `
    <div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" id="title" type="text" name="title" class="form-control"
           placeholder="Название товара" value='${this.productData.title}'>
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" id="description" class="form-control" name="description" data-element="productDescription"
        placeholder="Описание товара">${this.productData.description}</textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
        <ul class="sortable-list">
         ${this.getImages()}
        </ul>
        </div>
        <button type="button" name="uploadImage" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control"  id="subcategory"  data-element="productCategory">
         
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" id="price" name="price"
           class="form-control" placeholder="100" value='${this.productData.price}'>
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" id="discount" name="discount" class="form-control"
            placeholder="0" value='${this.productData.discount}'>
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" id="quantity" type="number" class="form-control" name="quantity"
         placeholder="1" value='${this.productData.quantity}'>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" id="status" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
           ${this.productId ? "Сохранить" : "Добавить"} товар
        </button>
      </div>
    </form>
  </div>
    `
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
