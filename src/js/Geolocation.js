import Modal from "./Modal";

export default class Geolocation {
  constructor() {
    this.modal = new Modal({
      closeBtn: true,
    });
    this.modal.setHeader("геоданные");
  }

  getCoord() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        // Запрос на получение геолокации
        navigator.geolocation.getCurrentPosition(
          (data) => {
            const { latitude, longitude } = data.coords;
            resolve({
              latitude,
              longitude,
            });
          },
          // Обработка ошибок при получении геолокации
          (err) => {
            if (err.code === 1) {
              this.modal.setContent("Получение геоданных отключено в браузере");
              this.modal.init(() => {
                this.modal.remove();
                resolve("");
              });
            } else {
              reject("Ошибка при получении геолокации");
            }
          }
        );
      } else {
        reject("Геолокация не поддерживается в этом браузере");
      }
    });
  }
}
