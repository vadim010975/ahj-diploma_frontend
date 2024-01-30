import { _URL } from "./Main";
import State from "./State";
import { dispatchCustomEvent } from "./functions";
import Modal from "./Modal";
import CryptoJS from "crypto-js";

export default class Encryption {
  constructor() {
    this.bindToDom();
    this.getState();
  }

  bindToDom() {
    this.checkboxEl = document.querySelector(".encryption_checkbox");
    this.onChangeCheckbox = this.onChangeCheckbox.bind(this);
    this.checkboxEl.addEventListener("change", this.onChangeCheckbox);
    this.btnEl = document.querySelector(".encryption-panel__btn");
    this.onClickBtn = this.onClickBtn.bind(this);
    this.btnEl.addEventListener("click", this.onClickBtn);
    this.key = "123456";
  }

  getState() {
    this.checkboxEl.checked = State.encriptionState;
  }

  setState() {
    State.encriptionState = this.checkboxEl.checked;
    State.setState();
    dispatchCustomEvent("encription", "change");
  }

  onChangeCheckbox() {
    this.setState();
  }

  async encrypt(text) {
    const { key } = await this.getKey();
    if (!key) {
      const modal = new Modal({
        closeBtn: true,
      });
      modal.setHeader("зашифрованное сообщение");
      modal.setContent("Создайте ключ для шифрования");
      modal.init(() => {
        modal.remove();
      });
      return;
    }
    return CryptoJS.AES.encrypt(text, key);
  }

  decrypt(text, key) {
    const decrypted = CryptoJS.AES.decrypt(text, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  onClickBtn() {
    const modal = new Modal({
      closeBtn: true,
      input: true,
    });
    modal.setHeader("зашифрованное сообщение");
    modal.setContent("Введите новый ключ от шифра");
    modal.init((res) => {
      if (res?.input) {
        modal.remove();
        this.saveKey(res.input);
      }
    });
  }

  async saveKey(key) {
    try {
      await fetch(_URL + `/key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
        }),
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getKey() {
    let response;
    try {
      response = await fetch(_URL + `/key`);
    } catch (error) {
      console.log(error);
    }
    return await response.json();
  }
}
