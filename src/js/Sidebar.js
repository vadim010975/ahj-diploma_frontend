import { _URL } from "./Main";
import { dispatchCustomEvent } from "./functions";
import { deactivateBtn } from "./functions";
import { activateBtn } from "./functions";

export default class Sidebar {
  constructor() {
    this.bindToDom();
    this.activity = false;
    this.handlerClick = null;
    this.listenToEvent();
  }

  bindToDom() {
    this.mainEl = document.querySelector(".main");
    this.element = document.querySelector(".sidebar");
    this.sidebarListTypes = this.element.querySelector(".sidebar__content");
    this.sidebarTitleEl = this.element.querySelector(".sidebar__title");
    this.onClickBtnSidebar = this.onClickBtnSidebar.bind(this);
    this.btnSidebarEl = document.querySelector(".btn_sidebar");
    this.btnSidebarEl.addEventListener("click", this.onClickBtnSidebar);
    this.imagesEl = this.element.querySelector(".count-images");
    this.onClickImages = this.onClickImages.bind(this);
    this.imagesEl.closest("li").addEventListener("click", this.onClickImages);
    this.videosEl = this.element.querySelector(".count-videos");
    this.onClickVideos = this.onClickVideos.bind(this);
    this.videosEl.closest("li").addEventListener("click", this.onClickVideos);
    this.audiosEl = this.element.querySelector(".count-audios");
    this.onClickAudios = this.onClickAudios.bind(this);
    this.audiosEl.closest("li").addEventListener("click", this.onClickAudios);
    this.messagesEl = this.element.querySelector(".count-messages");
    this.onClickMessages = this.onClickMessages.bind(this);
    this.messagesEl
      .closest("li")
      .addEventListener("click", this.onClickMessages);
    this.linksEl = this.element.querySelector(".count-links");
    this.onClickLinks = this.onClickLinks.bind(this);
    this.linksEl.closest("li").addEventListener("click", this.onClickLinks);
    this.encryptedMessagesEl = this.element.querySelector(
      ".count-encrypted-messages"
    );
    this.onClickencryptedMessages = this.onClickEncryptedMessages.bind(this);
    this.encryptedMessagesEl
      .closest("li")
      .addEventListener("click", this.onClickEncryptedMessages);
    this.otherFilesEl = this.element.querySelector(".count-other-files");
    this.onClickOtherFiles = this.onClickOtherFiles.bind(this);
    this.otherFilesEl
      .closest("li")
      .addEventListener("click", this.onClickOtherFiles);
  }

  activate() {
    this.activity = true;
    this.element.classList.add("active");
    setTimeout(() => {
      this.sidebarListTypes.classList.add("active");
      this.getInformation();
    }, 300);
    dispatchCustomEvent("sidebar", "start");
  }

  deactivate() {
    this.activity = false;
    this.element.classList.remove("active");
    this.sidebarListTypes.classList.remove("active");
    this.handlerClick({ type: "all" });
    dispatchCustomEvent("sidebar", "end");
  }

  onClickBtnSidebar() {
    if (this.activity) {
      this.deactivate();
      return;
    }
    this.activate();
  }

  async getInformation() {
    try {
      const response = await fetch(_URL + "/getinformation");
      const data = await response.json();
      this.renderInformation(data);
    } catch (error) {
      console.log(error);
    }
  }

  renderInformation(data) {
    this.sidebarTitleEl.textContent = "Найдено " + data.all;
    this.imagesEl.textContent = data.images;
    this.videosEl.textContent = data.videos;
    this.audiosEl.textContent = data.audios;
    this.messagesEl.textContent = data.messages;
    this.linksEl.textContent = data.links;
    this.encryptedMessagesEl.textContent = data.encryptedMessage;
    this.otherFilesEl.textContent = data.otherFiles;
  }

  onClickVideos() {
    this.handlerClick({ type: "video" });
  }

  onClickAudios() {
    this.handlerClick({ type: "audio" });
  }

  onClickImages() {
    this.handlerClick({ type: "image" });
  }

  onClickMessages() {
    this.handlerClick({ type: "message" });
  }

  onClickLinks() {
    this.handlerClick({ type: "link" });
  }

  onClickEncryptedMessages() {
    this.handlerClick({ type: "encrypted_message" });
  }

  onClickOtherFiles() {
    this.handlerClick({ type: "otherFile" });
  }

  listenToEvent() {
    this.mainEl.addEventListener("changeState", (e) => {
      if (e.detail.device === "sidebar") return;
      if (e.detail.state === "start") {
        deactivateBtn.call(this, "btnSidebarEl", "onClickBtnSidebar");
        return;
      }
      if (e.detail.state === "end") {
        activateBtn.call(this, "btnSidebarEl", "onClickBtnSidebar");
      }
    });
  }
}
