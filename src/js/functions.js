export function deactivateBtn(btnEl, handler, opacity = 0.5) {
  this[btnEl].style.opacity = opacity;
  this[btnEl].style.cursor = "default";
  this[btnEl].removeEventListener("click", this[handler]);
}

export function activateBtn(btnEl, handler) {
  this[btnEl].removeAttribute("style");
  this[btnEl].addEventListener("click", this[handler]);
}

export function dispatchCustomEvent(device, state) {
  const event = new CustomEvent("changeState", {
    detail: {
      device,
      state,
    },
  });
  document.querySelector(".main").dispatchEvent(event);
}
