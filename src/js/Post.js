import { _URL } from "./Main";
import Modal from "./Modal";
import MediaPlayer from "./MediaPlayer";
import { encription } from "./app";

export default class Post {
  constructor(data) {
    this.data = data;
    this.createElement();
    this.handlerClickBtnRemove = null;
  }

  createElement() {
    this.element = document.createElement("li");
    this.element.classList.add("list-item");
    this.element.dataset.id = this.data.date;
    this.element.innerHTML = `
      <div class="item-container">
        <div class="item-header">
          <div class="item-geolocation hidden"></div>
          <h4 class="item-title"></h4>
        </div>
        <div class="item-content"></div>
        <div class="item-buttons">
          <div style="opacity: 0; flex-grow: 1"></div>
          <button class="item-btn-remove"></button>
        </div>
      </div>`;
    this.titleEl = this.element.querySelector(".item-title");
    this.geolocationEl = this.element.querySelector(".item-geolocation");
    this.itemContentEl = this.element.querySelector(".item-content");
    this.btnsEl = this.element.querySelector(".item-buttons");
    this.btnRemove = this.element.querySelector(".item-btn-remove");
    this.onClickBtnRemove = this.onClickBtnRemove.bind(this);
    this.btnRemove.addEventListener("click", this.onClickBtnRemove);
    this.setDate();
    this.setContent();
    this.setGeolocation();
  }

  setDate() {
    const date =
      new Date(+this.data.date).toLocaleTimeString().slice(0, -3) +
      " " +
      new Date(+this.data.date).toLocaleDateString();
    this.titleEl.textContent = date;
  }

  setContent() {
    let contentElement, typeNameEl;
    if (this.data.type === "encrypted_message") {
      contentElement = this.createEncryptedPost();
      this.itemContentEl.appendChild(contentElement);
      return;
    }
    if (this.data.type === "message" || this.data.type === "link") {
      contentElement = document.createElement("p");
      contentElement.classList.add("content-message");
      const text = this.data.message;
      if (this.data.type === "link") {
        /* eslint-disable-next-line */
        const re = /(https?|ftp):\/\/\S+[^\s.,> )\];'\"!?]/gi;
        const subst = '<a href="$&" target="_blank">$&</a>';
        const withlink = text.replaceAll(re, subst);
        contentElement.innerHTML = withlink;
      } else {
        contentElement.textContent = text;
      }
      this.itemContentEl.appendChild(contentElement);
      return;
    }
    const typeFile = this.data.mimetype.split("/")[0];
    switch (typeFile) {
      case "image":
        contentElement = document.createElement("img");
        contentElement.classList.add("content-img");
        contentElement.src = _URL + this.data.filePath;
        break;
      case "audio":
        contentElement = document.createElement("div");
        /* eslint-disable-next-line */
        contentElement.classList.add("item-wrapper", "media-wrapper");
        contentElement.addEventListener(
          "click",
          this.showMediaPlayer.bind(this, "audio")
        );
        /* eslint-disable-next-line */
        typeNameEl = document.createElement("div");
        typeNameEl.classList.add("item-type-name");
        typeNameEl.textContent = "аудио";
        contentElement.appendChild(typeNameEl);
        break;
      case "video":
        contentElement = document.createElement("div");
        /* eslint-disable-next-line */
        contentElement.classList.add("item-wrapper", "media-wrapper");
        contentElement.addEventListener(
          "click",
          this.showMediaPlayer.bind(this, "video")
        );
        /* eslint-disable-next-line */
        typeNameEl = document.createElement("div");
        typeNameEl.classList.add("item-type-name");
        typeNameEl.textContent = "видео";
        contentElement.appendChild(typeNameEl);
        break;
      default:
        contentElement = document.createElement("div");
        /* eslint-disable-next-line */
        contentElement.classList.add("item-wrapper");
        /* eslint-disable-next-line */
        const extnameEl = document.createElement("div");
        extnameEl.classList.add("item-extname");
        extnameEl.textContent = this.data.extname;
        contentElement.appendChild(extnameEl);
    }
    this.btnLoad = document.createElement("button");
    this.btnLoad.classList.add("item-btn-load");
    this.btnLoad.textContent = "Скачать файл";
    this.onClickBtnLoad = this.onClickBtnLoad.bind(this);
    this.btnLoad.addEventListener("click", this.onClickBtnLoad);
    this.btnsEl.insertAdjacentElement("afterbegin", this.btnLoad);
    this.itemContentEl.appendChild(contentElement);
    const fNameEl = document.createElement("div");
    fNameEl.classList.add("item-content-file-name");
    fNameEl.textContent = this.data.fileName;
    this.itemContentEl.appendChild(fNameEl);
  }

  setGeolocation() {
    if (this.data.geolocation) {
      this.geolocationEl.classList.remove("hidden");
      this.geolocationEl.textContent = `[${this.data.geolocation.latitude}, ${this.data.geolocation.longitude}]`;
    }
  }

  get() {
    return this.element;
  }

  async onClickBtnLoad() {
    const response = await fetch(_URL + this.data.filePath);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.download = this.data.fileName;
    link.href = window.URL.createObjectURL(blob);
    link.click();
  }

  onClickBtnRemove() {
    const modal = new Modal({
      okBtn: true,
      cancelBtn: true,
    });
    modal.setHeader("удаление поста");
    modal.setContent("Вы уверены, что хотите удалить пост?");
    modal.init((res) => {
      if (res?.okBtn) {
        this.handlerClickBtnRemove(this.data.date);
      }
      modal.remove();
    });
  }

  showMediaPlayer(type) {
    MediaPlayer.show(type, _URL + this.data.filePath);
  }

  createEncryptedPost() {
    const contentElement = document.createElement("div");
    contentElement.classList.add("item-wrapper");
    contentElement.addEventListener("click", () => {
      this.getDecryptedMessage((decryptedMessage) => {
        this.createDecryptedPost(decryptedMessage);
      });
    });
    const typeNameEl = document.createElement("div");
    typeNameEl.classList.add("item-type-name", "encription-message_title");
    typeNameEl.textContent = "зашифрованное сообщение";
    contentElement.appendChild(typeNameEl);
    return contentElement;
  }

  getDecryptedMessage(callback) {
    const modal = new Modal({
      closeBtn: true,
      input: true,
    });
    modal.setHeader("зашифрованное сообщение");
    modal.setContent("Введите ключ от шифра");
    modal.init((res) => {
      if (res?.input) {
        modal.remove();
        callback(encription.decrypt(this.data.message, res.input));
      }
    });
  }

  createDecryptedPost(decryptedMessage) {
    if (!decryptedMessage) {
      const modal = new Modal({
        closeBtn: true,
      });
      modal.setHeader("зашифрованное сообщение");
      modal.setContent("Ключ не подошел");
      modal.init(() => {});
      return;
    }
    const contentElement = document.createElement("p");
    contentElement.classList.add("content-message");
    contentElement.textContent = decryptedMessage;
    this.itemContentEl.innerHTML = "";
    this.itemContentEl.appendChild(contentElement);
  }
}
