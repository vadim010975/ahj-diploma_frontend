import { _URL } from "./Main";
import AudioRecoder from "./AudioRecoder";
import VideoRecoder from "./VideoRecoder";
import Modal from "./Modal";
import Geolocation from "./Geolocation";
import { dispatchCustomEvent } from "./functions";
import { deactivateBtn } from "./functions";
import { activateBtn } from "./functions";
import State from "./State";
import { encription } from "./app";

export default class Sending {
  constructor() {
    this.bindToDom();
    this.processResponse = null;
    this.audioRecoder = new AudioRecoder(this.createAudio.bind(this));
    this.audioRecoder.handlerClickBtnCancel =
      this.hideRecordControlsEl.bind(this);
    this.videoRecoder = new VideoRecoder(this.createVideo.bind(this));
    this.videoRecoder.handlerClickBtnCancel =
      this.hideRecordControlsEl.bind(this);
    this.geolocation = new Geolocation();
    this.setStateIconGeolocation();
    this.listenToEvent();
  }

  bindToDom() {
    this.mainEl = document.querySelector(".main");
    this.mainEl.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    this.onDropMain = this.onDropMain.bind(this);
    this.mainEl.addEventListener("drop", this.onDropMain);
    this.formEl = document.querySelector(".main__footer_form");
    this.onSubmitForm = this.onSubmitForm.bind(this);
    this.formEl.addEventListener("submit", this.onSubmitForm);
    this.formInputEl = document.querySelector(".main__footer_input");
    this.onInput = this.onInput.bind(this);
    this.formInputEl.addEventListener("input", this.onInput);
    this.btnFileSelectEl = document.querySelector(".btn-file");
    this.onClickBtnFileSelect = this.onClickBtnFileSelect.bind(this);
    this.btnFileSelectEl.addEventListener("click", this.onClickBtnFileSelect);
    this.inputFileEl = document.querySelector(".main__footer_input_file");
    this.onChangeInputFile = this.onChangeInputFile.bind(this);
    this.inputFileEl.addEventListener("change", this.onChangeInputFile);
    this.btnAudioEl = document.querySelector(".btn-audio");
    this.onClickBtnAudio = this.onClickBtnAudio.bind(this);
    this.btnAudioEl.addEventListener("click", this.onClickBtnAudio);
    this.btnVideoEl = document.querySelector(".btn-video");
    this.onClickBtnVideo = this.onClickBtnVideo.bind(this);
    this.btnVideoEl.addEventListener("click", this.onClickBtnVideo);
    this.inputControlsEl = document.querySelector(
      ".main__footer_input_controls"
    );
    this.recordControlsEl = document.querySelector(".main__record-controls");
    this.locationIconEl = document.querySelector(".header__location_icon");
    this.onClickLocationIcon = this.onClickLocationIcon.bind(this);
    this.locationIconEl.addEventListener("click", this.onClickLocationIcon);
  }

  onClickLocationIcon() {
    State.geolocationState = !State.geolocationState;
    State.setState();
    const modalMessage = new Modal({
      okBtn: true,
    });
    modalMessage.setHeader("геоданные");
    if (State.geolocationState) {
      modalMessage.setContent("Геолокация браузера будет сохраняться");
    } else {
      modalMessage.setContent("Геолокация браузера не будет сохраняться");
    }
    modalMessage.init(() => {
      modalMessage.remove();
      this.setStateIconGeolocation();
      dispatchCustomEvent("geolocation", "change");
    });
  }

  renderlocationIcon() {
    this.locationIconEl.classList.add("active");
  }

  hidelocationIcon() {
    this.locationIconEl.classList.remove("active");
  }

  setStateIconGeolocation() {
    if (State.geolocationState) {
      this.renderlocationIcon();
    } else {
      this.hidelocationIcon();
    }
  }

  onDropMain(e) {
    e.preventDefault();
    this.inputFileEl.files = e.dataTransfer.files && e.dataTransfer.files;
    this.inputFileEl.dispatchEvent(new Event("change"));
  }

  onClickBtnFileSelect() {
    this.inputFileEl.dispatchEvent(new MouseEvent("click"));
  }

  async onChangeInputFile() {
    const file = this.inputFileEl.files && this.inputFileEl.files[0];
    if (!file) return;
    try {
      const formData = new FormData(this.formEl);
      if (State.geolocationState) {
        const geolocation = await this.geolocation.getCoord();
        formData.set("geolocation", JSON.stringify(geolocation));
      }
      const response = await fetch(_URL + "/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      this.processResponse(data);
      this.formEl.reset();
    } catch (error) {
      this.formEl.reset();
      console.log(error);
    }
  }

  async onSubmitForm(e) {
    e.preventDefault();
    if (!this.formInputEl.value.trim()) {
      this.formInputEl.value = "";
      return;
    }
    try {
      let address;
      if (
        this.formInputEl.value.search(
          /* eslint-disable-next-line */
          /(https?|ftp):\/\/\S+[^\s.,> )\];'\"!?]/gi
        ) !== -1
      ) {
        address = "/link";
      } else {
        address = "/message";
      }
      const formData = new FormData(this.formEl);
      if (State.encriptionState) {
        const encryptedMessage = await encription.encrypt(
          this.formInputEl.value
        );
        if (!encryptedMessage) {
          this.formInputEl.value = "";
          dispatchCustomEvent("input", "end");
          return;
        }
        formData.set("text", encryptedMessage);
        address = "/encrypted_message";
      }
      if (State.geolocationState) {
        const geolocation = await this.geolocation.getCoord();
        if (geolocation) {
          formData.set("geolocation", JSON.stringify(geolocation));
        }
      }
      const response = await fetch(_URL + address, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      this.processResponse(data);
      this.formEl.reset();
    } catch (error) {
      this.formEl.reset();
      console.log(error);
    }
    this.activateBtnFileSelect();
    dispatchCustomEvent("input", "end");
  }

  createAudio(blob) {
    this.hideRecordControlsEl();
    if (blob === null) {
      const warningModal = new Modal({
        closeBtn: true,
      });
      warningModal.setHeader("предупреждение");
      warningModal.setContent(
        "Отсутсвует разрешение на использование микрофона."
      );
      warningModal.init(() => {
        warningModal.remove();
        dispatchCustomEvent("media", "end");
      });
      return;
    }
    let fileName = "My_audio.wav";
    const modal = new Modal({
      closeBtn: true,
      input: true,
      okBtn: true,
    });
    modal.setHeader("название аудио");
    modal.setContent("Введите название записанному аудио.");
    modal.init((res) => {
      if (res?.input) {
        fileName = res.input + ".wav";
      }
      modal.remove();
      const file = new File([blob], fileName);
      this.createMedia(file);
    });
  }

  createVideo(blob) {
    this.hideRecordControlsEl();
    if (blob === null) {
      this.videoRecoder.hideModalVideoEl();
      const warningModal = new Modal({
        closeBtn: true,
      });
      warningModal.setHeader("предупреждение");
      warningModal.setContent(
        "Отсутсвует разрешение на использование веб-камеры."
      );
      warningModal.init(() => {
        warningModal.remove();
        dispatchCustomEvent("media", "end");
      });
      return;
    }
    let fileName = "My_video.webm";
    const modal = new Modal({
      closeBtn: true,
      input: true,
      okBtn: true,
    });
    modal.setHeader("название видео");
    modal.setContent("Введите название записанному видео.");
    modal.init((res) => {
      if (res?.input) {
        fileName = res.input + ".webm";
      }
      modal.remove();
      const file = new File([blob], fileName);
      this.createMedia(file);
    });
  }

  createMedia(file) {
    // создадим fileList
    const dt = new DataTransfer();
    dt.items.add(file);
    const fileList = dt.files;
    this.inputFileEl.files = fileList;
    this.inputFileEl.dispatchEvent(new Event("change"));
  }

  renderRecordControlsEl() {
    this.inputControlsEl.classList.add("hidden");
    this.recordControlsEl.classList.remove("hidden");
  }

  hideRecordControlsEl() {
    this.recordControlsEl.classList.add("hidden");
    this.inputControlsEl.classList.remove("hidden");
  }

  onClickBtnAudio() {
    this.renderRecordControlsEl(true);
    this.audioRecoder.init();
  }

  onClickBtnVideo() {
    this.renderRecordControlsEl(false);
    this.videoRecoder.init();
  }

  async getGeolocation() {
    const geolocation = await this.geolocation.getCoord();
    return geolocation;
  }

  onInput() {
    if (this.formInputEl.value) {
      dispatchCustomEvent("input", "start");
      return;
    }
    dispatchCustomEvent("input", "end");
  }

  activateBtnFileSelect() {
    this.btnFileSelectEl.classList.add("active");
    this.btnFileSelectEl.addEventListener("click", this.onClickBtnFileSelect);
  }

  deactivateBtnFileSelect() {
    this.btnFileSelectEl.classList.remove("active");
    this.btnFileSelectEl.removeEventListener(
      "click",
      this.onClickBtnFileSelect
    );
  }

  deactivateInput() {
    this.formInputEl.style.display = "none";
    this.formInputEl.removeEventListener("input", this.onInput);
  }

  activateInput() {
    this.formInputEl.removeAttribute("style");
    this.formInputEl.addEventListener("input", this.onInput);
  }

  listenToEvent() {
    this.mainEl.addEventListener("changeState", (e) => {
      if (e.detail.device != "input") {
        if (e.detail.state === "start") {
          this.deactivateInput();
        }
        if (e.detail.state === "end") {
          this.activateInput();
        }
      }
      if (e.detail.state === "start") {
        deactivateBtn.call(this, "btnVideoEl", "onClickBtnVideo");
        deactivateBtn.call(this, "btnAudioEl", "onClickBtnAudio");
        this.deactivateBtnFileSelect();
        deactivateBtn.call(this, "locationIconEl", "onClickLocationIcon", 0.3);
        return;
      }
      if (e.detail.state === "end") {
        activateBtn.call(this, "btnVideoEl", "onClickBtnVideo");
        activateBtn.call(this, "btnAudioEl", "onClickBtnAudio");
        this.activateBtnFileSelect();
        activateBtn.call(this, "locationIconEl", "onClickLocationIcon");
      }
    });
  }
}
