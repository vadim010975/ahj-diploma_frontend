export const _URL = "http://localhost:7070";
import Post from "./Post";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Sending from "./Sending";
import Search from "./Search";
import State from "./State";

export default class Main {
  constructor(container) {
    this.containerEl = container;
    this.header = new Header();
    this.header.handlerHideInput = this.setDownloadType.bind(this);
    this.sidebar = new Sidebar();
    this.sidebar.handlerClick = this.setDownloadType.bind(this);
    this.sending = new Sending();
    this.sending.processResponse = this.createPostEverywhere.bind(this);
    this.lastPostDate = null;
    this.search = new Search();
    this.search.find = this.setDownloadType.bind(this);
    this.downloadType = "all";
    this.list = [];
  }

  init() {
    this.bindToDOM();
    this.loadHistory({ type: this.downloadType });
    this.initSharedWorker("worker.js");
    this.listenToEvent();
  }

  bindToDOM() {
    this.listItemsEl = this.containerEl.querySelector(".main__list-items");
    this.onScrollListItems = this.onScrollListItems.bind(this);
    this.listItemsEl.addEventListener("scroll", this.onScrollListItems);
  }

  onScrollListItems() {
    if (this.lastPostDate === "end") {
      return;
    }
    const position = this.listItemsEl.scrollTop;
    const clientHeight = this.listItemsEl.clientHeight;
    const scrollHeight = this.listItemsEl.scrollHeight;
    if (position === scrollHeight - clientHeight) {
      this.loadHistory({
        type: this.downloadType,
        lastPostDate: this.lastPostDate,
        text: this.search,
      });
    }
  }

  addPostUp(postEl) {
    this.listItemsEl.insertAdjacentElement("afterbegin", postEl);
    postEl.scrollIntoView(true);
  }

  addPostDown(postEl) {
    this.listItemsEl.insertAdjacentElement("beforeend", postEl);
  }

  createPostEverywhere(data) {
    this.list.unshift(data);
    this.sendToSharedWorker(this.list);
    this.createPost(data);
  }

  createPost(data, place) {
    const post = new Post(data);
    post.handlerClickBtnRemove = this.removePost.bind(this);
    if (place === "down") {
      this.addPostDown(post.get());
      return;
    }
    this.addPostUp(post.get());
  }

  async loadHistory(data) {
    try {
      let response;
      if (data.lastPostDate) {
        response = await fetch(_URL + `/loadHistory/next/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: data.type,
            postDate: data.lastPostDate,
            text: data.text,
          }),
        });
      } else {
        response = await fetch(
          _URL + `/loadHistory?type=${data.type}&text=${data.text}`
        );
      }
      if (response.statusText === "No Content") return;
      const history = await response.json();
      if (history.type !== "history") return;
      if (history.data.length === 10) {
        this.lastPostDate = history.data[9].date;
      } else {
        this.lastPostDate = "end";
      }
      this.uploadHistory(history);
    } catch (error) {
      console.log(error);
    }
  }

  uploadHistory(history) {
    for (let i = 0; i < history.data.length; i += 1) {
      this.list.push(history.data[i]);
    }
    this.sendToSharedWorker();
    this.renderPosts(history.data);
  }

  renderPosts(posts) {
    for (let i = 0; i < posts.length; i += 1) {
      this.createPost(posts[i], "down");
    }
  }

  removeElementHistoryEverywhere(date) {
    this.list = this.list.filter((item) => item.date != date);
    this.sendToSharedWorker();
    this.removeElementHistory(date);
  }

  removeElementHistory(date) {
    const element = this.containerEl.querySelector(`[data-id="${date}"]`);
    element.remove();
    const clientHeight = this.listItemsEl.clientHeight;
    const scrollHeight = this.listItemsEl.scrollHeight;
    if (this.lastPostDate !== "end" && clientHeight === scrollHeight) {
      this.loadHistory({
        type: this.downloadType,
        lastPostDate: this.lastPostDate,
      });
    }
  }

  async removePost(date) {
    const response = await fetch(_URL + "/remove", {
      method: "POST",
      body: date,
    });
    const dateDeletedItem = await response.text();
    if (dateDeletedItem) {
      this.removeElementHistoryEverywhere(dateDeletedItem);
    }
  }

  clear() {
    [...this.listItemsEl.children].forEach((el) => el.remove());
    this.list = [];
  }

  setDownloadType(data) {
    if (data.type === this.downloadType && data.type != "search") return;
    this.downloadType = data.type;
    this.searchText = data.text;
    this.clear();
    this.loadHistory({
      type: this.downloadType,
      text: this.searchText,
    });
  }

  initSharedWorker(worker) {
    this.worker = new SharedWorker(worker);
    this.worker.port.addEventListener(
      "message",
      (e) => {
        this.clear();
        this.list = e.data.list;
        this.renderPosts(this.list);
        this.listItemsEl.scrollTo(0, 0);
        this.downloadType = e.data.downloadType;
        this.lastPostDate = e.data.lastPostDate;
        this.searchText = e.data.searchText;
        if (State.geolocationState != e.data.geolocationState) {
          State.geolocationState = e.data.geolocationState;
          State.setState();
          this.sending.setStateIconGeolocation();
        }
        if (State.encriptionState != e.data.encriptionState) {
          State.encriptionState = e.data.encriptionState;
          State.setState();
          this.encription.getState();
        }
      },
      false
    );
    this.worker.port.start();
  }

  sendToSharedWorker() {
    this.worker.port.postMessage({
      list: this.list,
      downloadType: this.downloadType,
      lastPostDate: this.lastPostDate,
      search: this.searchText,
      geolocationState: State.geolocationState,
      encriptionState: State.encriptionState,
    });
  }

  listenToEvent() {
    this.containerEl.addEventListener("changeState", (e) => {
      if (e.detail.device != "geolocation" && e.detail.device != "encription")
        return;
      if (e.detail.state === "change") {
        this.sendToSharedWorker();
      }
    });
  }
}
