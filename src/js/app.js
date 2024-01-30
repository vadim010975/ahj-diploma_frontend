import Main from "./Main";
import State from "./State";
import Encryption from "./Encryption";

State.getState();

export const encription = new Encryption();

const mainEl = document.querySelector(".main");

const main = new Main(mainEl);

main.init();
