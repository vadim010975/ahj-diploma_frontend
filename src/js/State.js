export default class State {
  static geolocationState = false;
  static encriptionState = false;

  static getState() {
    if (!localStorage.getItem("chaosOrganizer")) {
      return;
    }
    State.geolocationState = JSON.parse(
      localStorage.getItem("chaosOrganizer")
    ).geolocationState;
    State.encriptionState = JSON.parse(
      localStorage.getItem("chaosOrganizer")
    ).encriptionState;
  }

  static setState() {
    localStorage.setItem(
      "chaosOrganizer",
      JSON.stringify({
        geolocationState: State.geolocationState,
        encriptionState: State.encriptionState,
      })
    );
  }
}
