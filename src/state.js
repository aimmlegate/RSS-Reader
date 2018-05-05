import { findUniq } from './helpers';

export default {
  data: {
    rssData: [],
    timeout: 5000,
    formStatus: {
      error: false,
      message: '',
    },
  },
  getFullStateData() {
    return this.data;
  },
  setFullStateData(newData) {
    this.data = newData;
  },
  getData() {
    return this.data.rssData;
  },
  eraseData() {
    this.data.rssData = [];
  },
  getTimeout() {
    return this.data.timeout;
  },
  setTimeout(newTimeout) {
    this.timeout = newTimeout;
    return this;
  },
  addData(newData) {
    const setStatusData = newData;
    setStatusData.updStatus = true;
    this.data.rssData = [...this.data.rssData, setStatusData];
    return this;
  },
  getFeed(feedId) {
    return this.data.rssData.filter(feed => feed.id === feedId)[0];
  },
  getFeedItems(feedId) {
    const thisFeed = this.getFeed(feedId);
    return thisFeed.children;
  },
  addFeedItems(feedId, newItems) {
    const thisFeed = this.getFeed(feedId);
    const thisFeedItems = this.getFeedItems(feedId);
    const addedItems = findUniq(thisFeedItems, newItems);
    thisFeed.children = [...thisFeedItems, ...addedItems];
    return addedItems;
  },
  addNewFeedUrl(feedId, feedUrl) {
    const thisFeed = this.getFeed(feedId);
    thisFeed.url = feedUrl;
    return this;
  },
  hasFeed(feedUrl) {
    return this.data.rssData.some(feed => feed.url === feedUrl);
  },
  getFormErr() {
    return this.data.formStatus.error;
  },
  getFormMessage() {
    return this.data.formStatus.message;
  },
  setFormError(message) {
    this.data.formStatus.error = true;
    this.data.formStatus.message = message;
    return this;
  },
  setFormNormal(message) {
    this.data.formStatus.error = false;
    this.data.formStatus.message = message;
    return this;
  },
};
