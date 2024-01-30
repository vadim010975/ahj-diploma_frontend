export default class MediaPlayer {
  static parent = document.querySelector(".page");

  static show(type, url) {
    const element = document.createElement("div");
    element.classList.add("modal__media_background");
    const mediaPlayer = document.createElement(type);
    mediaPlayer.classList.add("modal__media-player");
    mediaPlayer.controls = true;
    mediaPlayer.src = url;
    mediaPlayer.style.opacity = 0;
    const btnClose = document.createElement("button");
    btnClose.classList.add("modal__media-player_btn-close", "btn__close");
    btnClose.addEventListener("click", () => element.remove());
    element.insertAdjacentElement("beforeend", mediaPlayer);
    element.insertAdjacentElement("beforeend", btnClose);
    MediaPlayer.parent.insertAdjacentElement("beforeend", element);
    setTimeout(() => {
      const { height: modalHeight, width: modalWidth } =
        mediaPlayer.getBoundingClientRect();
      const {
        top: parentTop,
        left: parentLeft,
        width: parentWidth,
        height: parentHeight,
      } = element.getBoundingClientRect();
      const modalTop = parentTop + parentHeight / 2 - modalHeight / 2;
      const modalLeft = parentLeft + parentWidth / 2 - modalWidth / 2;
      mediaPlayer.style.top = modalTop + "px";
      mediaPlayer.style.left = modalLeft + "px";
      mediaPlayer.style.opacity = "";
      const btnCloseTop = modalTop - 30;
      const btnCloseLeft = modalLeft + modalWidth + 10;
      btnClose.style.top = btnCloseTop + "px";
      btnClose.style.left = btnCloseLeft + "px";
    }, 100);
  }
}
