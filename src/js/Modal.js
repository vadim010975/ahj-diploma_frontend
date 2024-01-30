const pageEl = document.querySelector(".page");

export default class Modal {
  constructor(setting, element = pageEl) {
    this.createElement(element);
    if (setting?.closeBtn) {
      this.renderCloselBtn();
    }
    if (setting?.input) {
      this.renderInput();
    }
    if (setting?.okBtn) {
      this.renderOkBtn();
    }
    if (setting?.cancelBtn) {
      this.renderCancelBtn();
    }
  }

  createElement(element) {
    this.parentEl = element;
    this.element = document.createElement("div");
    this.element.classList.add("modal");
    this.element.innerHTML = `
    <div class="modal__content">
      <div class="modal__header"></div>
      <div class="modal__body">
        <div class="modal__body_content"></div>
        <div class="modal__buttons"></div>
      </div>
    </div>`;
    this.contentEl = this.element.querySelector(".modal__content");
    this.headerEl = this.element.querySelector(".modal__header");
    this.bodyContentEl = this.element.querySelector(".modal__body_content");
    this.buttonsEl = this.element.querySelector(".modal__buttons");
  }

  init(callback) {
    this.callback = callback;
    this.parentEl.insertAdjacentElement("afterbegin", this.element);
    this.render();
  }

  render() {
    this.element.classList.add("active");
    const { height: modalHeight, width: modalWidth } =
      this.contentEl.getBoundingClientRect();
    const {
      top: parentTop,
      left: parentLeft,
      width: parentWidth,
      height: parentHeight,
    } = this.parentEl.getBoundingClientRect();
    const modalTop = parentTop + parentHeight / 2 - modalHeight / 2;
    const modalLeft = parentLeft + parentWidth / 2 - modalWidth / 2;
    this.contentEl.style.top = modalTop + "px";
    this.contentEl.style.left = modalLeft + "px";
  }

  hide() {
    this.element.classList.remove("active");
    this.clear();
  }

  setHeader(text) {
    this.headerEl.textContent = text.trim();
  }

  setContent(text) {
    this.bodyContentEl.textContent = text.trim();
  }

  renderCloselBtn() {
    this.closeBtn = document.createElement("button");
    this.closeBtn.classList.add("btn__close");
    this.contentEl.insertAdjacentElement("afterbegin", this.closeBtn);
    this.closeBtn.addEventListener("click", () => {
      this.callback({ closeBtn: true });
      this.hide();
    });
  }

  renderInput() {
    const formEl = document.createElement("form");
    formEl.classList.add("modal__form");
    formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = this.inputEl.value.trim();
      if (value) {
        this.callback({ input: value });
      }
      this.hide();
    });
    this.inputEl = document.createElement("input");
    this.inputEl.classList.add("modal__input");
    formEl.appendChild(this.inputEl);
    this.bodyContentEl.insertAdjacentElement("afterend", formEl);
  }

  renderOkBtn() {
    const okBtnEl = document.createElement("button");
    okBtnEl.classList.add("modal__btn");
    okBtnEl.textContent = "ок";
    okBtnEl.addEventListener("click", () => {
      const result = { okBtn: true };
      if (this.inputEl?.value) {
        result.input = this.inputEl.value;
      }
      this.callback(result);
      this.hide();
    });
    this.buttonsEl.insertAdjacentElement("afterbegin", okBtnEl);
  }

  renderCancelBtn() {
    const cancelBtnEl = document.createElement("button");
    cancelBtnEl.classList.add("modal__btn");
    cancelBtnEl.textContent = "отмена";
    cancelBtnEl.addEventListener("click", () => {
      this.callback({ cancelBtn: true });
      this.hide();
    });
    this.buttonsEl.insertAdjacentElement("beforeend", cancelBtnEl);
  }

  clear() {
    this.headerEl.textContent = "";
    this.bodyContentEl.textContent = "";
    if (this.inputEl) {
      this.inputEl.value = "";
    }
  }

  remove() {
    this.element.remove();
  }
}
