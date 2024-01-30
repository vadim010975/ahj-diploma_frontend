import { dispatchCustomEvent } from "./functions";

export default class AudioRecoder {
  constructor(callback) {
    this.callback = callback;
    this.mainEl = document.querySelector(".main");
    this.btnStartEl = document.querySelector(".btn-start");
    this.btnStopEl = document.querySelector(".btn-stop");
    this.timerEl = document.querySelector(".main__record-timer");
    this.mediaSettings = {
      audio: true,
    };
    this.updateTime = this.updateTime.bind(this);
    this.seconds = 0;
    this.minutes = 0;
    this.onClickBtnStart = this.onClickBtnStart.bind(this);
    this.recordTypeIconEl = document.querySelector(
      ".main__record-controls_icon"
    );
    this.recordTextEl = document.querySelector(".main__record-controls_text");
    this.btnCancelEl = document.querySelector(
      ".main__record-controls_btn.btn-cancel"
    );
    this.onClickBtnCancel = this.onClickBtnCancel.bind(this);
    this.handlerClickBtnCancel = null;
  }

  init() {
    this.btnStartEl.addEventListener("click", this.onClickBtnStart);
    this.btnCancelEl.addEventListener("click", this.onClickBtnCancel);
    dispatchCustomEvent("media", "start");
  }

  deinit() {
    this.btnStartEl.removeEventListener("click", this.onClickBtnStart);
    this.btnCancelEl.removeEventListener("click", this.onClickBtnCancel);
    if (this.mediaSettings.video) {
      this.hideModalVideoEl();
    }
    this.renderBtnStart();
    dispatchCustomEvent("media", "end");
  }

  /* eslint-disable-next-line */
  async onClickBtnStart() {
    try {
      this.btnStartEl.removeEventListener("click", this.onClickBtnStart);
      this.stream = await navigator.mediaDevices.getUserMedia(
        this.mediaSettings
      );
      this.renderBtnStop();
      this.startTimer();
      if (this.mediaSettings.video) {
        this.onlinePlay(this.stream);
      }
      this.renderIconAndText();
      this.deactivateBtnCancel();
      this.recoder = new MediaRecorder(this.stream);
      const chunks = [];
      this.recoder.addEventListener("start", () => {
        this.onStart();
      });
      this.recoder.addEventListener("dataavailable", (e) => {
        chunks.push(e.data);
      });
      this.recoder.addEventListener("stop", () => {
        let blob;
        if (this.mediaSettings.video) {
          blob = new Blob(chunks, {
            type: "video/webm",
          });
        } else {
          blob = new Blob(chunks, {
            type: "audio/wav",
          });
        }
        this.callback(blob);
      });
      this.recoder.start();
    } catch (e) {
      console.log(e);
      this.callback(null);
    }
  }

  onStart() {
    this.btnStopEl.addEventListener("click", () => {
      this.recoder.stop();
      this.stream.getTracks().forEach((track) => track.stop());
      this.stopTimer();
      if (this.mediaSettings.video) {
        this.hideModalVideoEl();
      }
      this.renderBtnStart();
      this.hideIconAndText();
      this.actvateBtnCancel();
      dispatchCustomEvent("media", "end");
    });
  }

  startTimer() {
    this.interval = setInterval(this.updateTime, 1000);
  }

  stopTimer() {
    clearInterval(this.interval);
    this.seconds = 0;
    this.minutes = 0;
    this.timerEl.textContent = "00:00";
  }

  updateTime() {
    this.seconds += 1;
    if (this.seconds === 60) {
      this.minutes += 1;
      this.seconds = 0;
    }
    if (this.minutes === 60) {
      this.minutes = 0;
    }
    this.timerEl.textContent = `${this.minutes
      .toString()
      .padStart(2, "0")}:${this.seconds.toString().padStart(2, "0")}`;
  }

  renderBtnStop() {
    this.btnStartEl.classList.add("hidden");
    this.btnStopEl.classList.remove("hidden");
  }

  renderBtnStart() {
    this.btnStopEl.classList.add("hidden");
    this.btnStartEl.classList.remove("hidden");
  }

  renderIconAndText() {
    if (this.mediaSettings.video) {
      this.recordTypeIconEl.classList.add("btn-video");
      this.recordTextEl.textContent = "Запись видео";
      return;
    }
    this.recordTypeIconEl.classList.add("btn-audio");
    this.recordTextEl.textContent = "Запись аудио";
  }

  hideIconAndText() {
    this.recordTypeIconEl.classList.remove("btn-video", "btn-audio");
    this.recordTextEl.textContent = "";
  }

  onClickBtnCancel() {
    this.deinit();
    this.handlerClickBtnCancel();
  }

  deactivateBtnCancel() {
    this.btnCancelEl.classList.remove("active");
    this.btnCancelEl.removeEventListener("click", this.onClickBtnCancel);
  }

  actvateBtnCancel() {
    this.btnCancelEl.classList.add("active");
    this.btnCancelEl.addEventListener("click", this.onClickBtnCancel);
  }
}
