import { dispatchCustomEvent } from "./functions";
import { deactivateBtn } from "./functions";
import { activateBtn } from "./functions";

export default class Header {
  constructor() {
    this.bindToDom();
    this.activityInputEl = false;
    this.handlerClickBtnSidebar = null;
    this.handlerHideInput = null;
    this.mainEl = document.querySelector(".main");
    this.listenToEvent();
  }

  bindToDom() {
    const element = document.querySelector(".main__header");
    this.inputEl = element.querySelector(".main__header_input");
    this.btnSearchEl = element.querySelector(".btn_search");
    this.onClickBtnSearch = this.onClickBtnSearch.bind(this);
    this.btnSearchEl.addEventListener("click", this.onClickBtnSearch);
    this.btnInputClose = element.querySelector(".header__btn_input_close");
    this.onClickBtnInputClose = this.onClickBtnInputClose.bind(this);
    this.btnInputClose.addEventListener("click", this.onClickBtnInputClose);
  }

  onClickBtnSearch() {
    this.activityInputEl = !this.activityInputEl;
    if (this.activityInputEl) {
      this.activate();
      return;
    }
    this.deactivate();
  }

  onClickBtnInputClose(e) {
    e.preventDefault();
    this.activityInputEl = false;
    this.deactivate();
  }

  activate() {
    this.renderInputEl();
    dispatchCustomEvent("search", "start");
  }

  deactivate() {
    this.hideInputEl();
    dispatchCustomEvent("search", "end");
  }

  renderInputEl() {
    this.inputEl.classList.add("active");
  }

  hideInputEl() {
    this.inputEl.value = "";
    this.inputEl.classList.remove("active");
    this.handlerHideInput({ type: "all" });
  }

  listenToEvent() {
    this.mainEl.addEventListener("changeState", (e) => {
      if (e.detail.device === "search") return;
      if (e.detail.state === "start") {
        deactivateBtn.call(this, "btnSearchEl", "onClickBtnSearch");
        return;
      }
      if (e.detail.state === "end") {
        activateBtn.call(this, "btnSearchEl", "onClickBtnSearch");
      }
    });
  }
}
