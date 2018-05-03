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
  getAddedFeeds() {
    const feedData = this.getData();
    return feedData.map(feed => feed.url);
  },
  addData(newData) {
    this.rssData = [...this.rssData, newData];
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
  addNewFeed(feedId, feedUrl) {
    const thisFeed = this.getFeed(feedId);
    thisFeed.url = feedUrl;
    return this;
  },
  getIdbyUrl(feedUrl) {
    const feeds = this.getData();
    const findedFeed = feeds.filter(feed => feed.url === feedUrl)[0];
    return findedFeed.id;
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
};
