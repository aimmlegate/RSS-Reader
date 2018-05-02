import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { isURL } from 'validator';
import _ from 'lodash';
import axios from 'axios';
import state from './state';
import { renderFeedItems, renderFeeds } from './renders';
import { checkParseErr, parseHtmlCollection, findInRss, normalizeUrl } from './helpers';

const resultsCont = document.getElementById('results');
const feedForm = document.getElementById('feed-form');
const errMessage = document.getElementById('error-message');
const modalDescription = document.getElementById('modal-description');
const input = document.querySelector('#feed-input');
const corsProxy = 'http://cors-proxy.htmldriven.com';
const parser = new DOMParser();

const htmlRender = (str, target) => {
  input.value = '';
  const renderTo = target;
  renderTo.innerHTML = str;
};

const getAxiosData = (url, cors, status = { type: 'newFeed', id: null }) => {
  const renderDispatcher = {
    newFeed: () => {
      const targetCont = document.getElementById('results');
      const data = state.getData();
      const renderedStr = renderFeeds(data);
      htmlRender(renderedStr, targetCont);
    },
    updateFeed: (targetId) => {
      const targetCont = document.querySelector(`[data-uid="${targetId}"]`).querySelector('.feedContent');
      const data = state.getFeedItems(targetId);
      const renderedStr = renderFeedItems(data);
      htmlRender(renderedStr, targetCont);
    },
  };
  const dataDispatcher = {
    newFeed: (data, feedUrl) => {
      const parsed = parseHtmlCollection(data);
      state.addData(parsed);
      state.addNewFeed(parsed.id, feedUrl);
    },
    updateFeed: (data, feedUrl, id) => {
      const parsed = parseHtmlCollection(data);
      state.addFeedItems(id, parsed.children);
    },
  };
  const proxyUrl = new URL('/?url=', cors);
  const newUrl = normalizeUrl(url);
  axios.get(new URL(`${proxyUrl.href}${newUrl}`), { timeout: 10000 })
    .then((resp) => {
      const { body } = resp.data;
      const parsedData = parser.parseFromString(body, 'application/xml');
      if (!checkParseErr((parsedData))) {
        dataDispatcher[status.type](parsedData, url, status.id);
      } else {
        state.setFormError('Parsing error');
      }
    })
    .then(() => {
      if (state.getFormErr()) {
        input.classList.add('is-invalid');
        errMessage.textContent = state.getFormMessage();
      } else {
        state.setFormNormal('Rendered');
        input.classList.remove('is-invalid');
        renderDispatcher[status.type](status.id);
      }
    })
    .catch((err) => {
      state.setFormError('Network error');
      input.classList.add('is-invalid');
      errMessage.textContent = state.getFormMessage();
      console.error(err);
    });
};

const startFeedUpdater = () => {
  const currentFeeds = state.getAddedFeeds();
  currentFeeds.forEach((feedUrl) => {
    const feedId = state.getIdbyUrl(feedUrl);
    getAxiosData(feedUrl, corsProxy, { type: 'updateFeed', id: feedId });
  });
  const newTimeoutId = setTimeout(startFeedUpdater, 5000);
};


const feedHandler = (event) => {
  event.preventDefault();
  const { target } = event;
  const formData = _.fromPairs([...new FormData(target)]);
  if (!(isURL(formData.feedUrl))) {
    state.setFormError('Invalid URL');
  } else if (state.hasFeed(normalizeUrl(formData.feedUrl))) {
    state.setFormError('Feed already exist');
  } else {
    state.setFormNormal('Added');
  }

  if (state.getFormErr()) {
    input.classList.add('is-invalid');
    errMessage.textContent = state.getFormMessage();
  } else {
    getAxiosData(formData.feedUrl, corsProxy);
  }
};


const handler = (event) => {
  const { target } = event;
  if (target.dataset.toggle === 'modal') {
    const parent = target.parentElement;
    const mainParent = parent.closest('.jumbotron');
    const itemUid = parent.dataset.uid;
    const feedUid = mainParent.dataset.uid;
    const feed = findInRss(feedUid, state.getData());
    const { description } = findInRss(itemUid, feed.children);
    modalDescription.textContent = description;
    $('#descriptionModal').modal('toggle');
  }
};

startFeedUpdater();
feedForm.addEventListener('submit', feedHandler);
resultsCont.addEventListener('click', handler);
