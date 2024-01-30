import AudioRecoder from "./AudioRecoder";

export default class VideoRecoder extends AudioRecoder {
  constructor(callback) {
    super(callback);
    this.mediaSettings = {
      audio: true,
      video: true,
    };
    this.modalVideoEl = document.querySelector(".modal-video");
  }

  init() {
    super.init();
    this.showModalVideoEl();
  }

  showModalVideoEl() {
    this.modalVideoEl.classList.remove("hidden");
    const { width: modalWidth } = this.modalVideoEl.getBoundingClientRect();
    const listEl = document.querySelector(".main__list-container");
    const {
      top: listTop,
      left: listLeft,
      width: listWidth,
    } = listEl.getBoundingClientRect();
    const modalTop = listTop + 50;
    const modalLeft = listLeft + listWidth / 2 - modalWidth / 2;
    this.modalVideoEl.style.top = modalTop + "px";
    this.modalVideoEl.style.left = modalLeft + "px";
  }

  hideModalVideoEl() {
    this.modalVideoEl.classList.add("hidden");
  }

  onlinePlay(stream) {
    this.modalVideoEl.muted = true;
    this.modalVideoEl.srcObject = stream;
    this.modalVideoEl.addEventListener("canplay", this.modalVideoEl.play);
  }
}
