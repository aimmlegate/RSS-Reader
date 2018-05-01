export default {
  rssData: [],
  addedFeeds: new Set(),
  formStatus: {
    error: false,
    message: '',
  },
  addData(newData) {
    this.rssData = [...this.rssData, newData];
    return this;
  },
  getData() {
    return this.rssData;
  },
  newFeed(feed) {
    this.addedFeeds.add(feed);
    return this;
  },
  hasFeed(feed) {
    return this.addedFeeds.has(feed);
  },
  getFormErr() {
    return this.formStatus.error;
  },
  getFormMessage() {
    return this.formStatus.message;
  },
  setFormError(message) {
    this.formStatus.error = true;
    this.formStatus.message = message;
    return this;
  },
  setFormNormal(message) {
    this.formStatus.error = false;
    this.formStatus.message = message;
    return this;
  },
};
