import { findUniq } from './helpers';

export default {
  rssData: [],
  timeout: 5000,
  formStatus: {
    error: false,
    message: '',
  },
  getData() {
    return this.rssData;
  },
  getTimeout() {
    return this.timeout;
  },
  setTimeout(newTimeout) {
    this.timeout = newTimeout;
    return this;
  },
  addData(newData) {
    const setStatusData = newData;
    setStatusData.updStatus = true;
    this.rssData = [...this.rssData, setStatusData];
    return this;
  },
  getFeed(feedId) {
    return this.rssData.filter(feed => feed.id === feedId)[0];
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
    return this.rssData.some(feed => feed.url === feedUrl);
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
  setUpdateStatusFin(feedId, status) {
    if (feedId) {
      const feed = this.getFeed(feedId);
      feed.updStatus = status;
    }
    return this;
  },
  getUpdateStatusFin(feedId) {
    if (feedId) {
      const feed = this.getFeed(feedId);
      return feed.updStatus;
    }
    return this;
  },
};
