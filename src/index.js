import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { isURL } from 'validator';
import _ from 'lodash';
import axios from 'axios';
import state from './state';
import {
  renderFeedItems,
  htmlAppendRender,
  renderFeed,
  renderTabControl,
} from './renders';
import { checkParseErr, parseHtmlCollection, findInRss, normalizeUrl } from './helpers';

const resultsCont = document.getElementById('results');
const feedForm = document.getElementById('feed-form');
const errMessage = document.getElementById('error-message');
const modalDescription = document.getElementById('modal-description');
const updateTimeSelect = document.getElementById('update-time-select');
const input = document.querySelector('#feed-input');
const corsProxy = 'http://cors-proxy.htmldriven.com';
const parser = new DOMParser();

const renderDispatcher = {
  newFeed: (feedId) => {
    const targetCont = document.getElementById('v-pills-tabContent');
    const targetControlCont = document.getElementById('v-pills-tab');
    const data = state.getData();
    const renderedStr = renderFeed(data, feedId);
    const renderedControlStr = renderTabControl(data, feedId);
    htmlAppendRender(renderedStr, targetCont);
    htmlAppendRender(renderedControlStr, targetControlCont);
    input.value = '';
    $('.nav-pills').find(`[data-tab='${feedId}']`).tab('show');
  },
  updateFeed: (targetId) => {
    const targetCont = document.querySelector(`[data-uid="${targetId}"]`).querySelector('.feedContent');
    const data = state.getFeedItems(targetId);
    const alredyRendered = [...targetCont.querySelectorAll('li')];
    const alredyRenderedSet = new Set(alredyRendered.map(el => el.dataset.uid));
    const newData = data.filter(el => !alredyRenderedSet.has(el.id));
    const renderedStr = renderFeedItems(newData);
    htmlAppendRender(renderedStr, targetCont);
  },
};

const dataDispatcher = {
  newFeed: (data, feedUrl) => {
    state.addData(data);
    state.addNewFeed(data.id, feedUrl);
  },
  updateFeed: (data, feedUrl, id) => {
    state.addFeedItems(id, data.children);
  },
};

const getAxiosData = (url, cors, status = { type: 'newFeed', id: null }) => {
  const proxyUrl = new URL('/?url=', cors);
  const newUrl = normalizeUrl(url);
  axios.get(new URL(`${proxyUrl.href}${newUrl}`), { timeout: 5000 })
    .then((resp) => {
      const { body } = resp.data;
      const parsedData = parser.parseFromString(body, 'application/xml');
      if (!checkParseErr((parsedData))) {
        const data = parseHtmlCollection(parsedData);
        dataDispatcher[status.type](data, url, status.id);
      } else {
        state.setFormError('Parsing error');
      }

      if (state.getFormErr()) {
        input.classList.add('is-invalid');
        errMessage.textContent = state.getFormMessage();
      } else {
        state.setFormNormal('Rendered');
        input.classList.remove('is-invalid');
        const data = parseHtmlCollection(parsedData);
        renderDispatcher[status.type](status.id || data.id);
      }
    })
    .catch((err) => {
      state.setFormError('Error');
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
  setTimeout(startFeedUpdater, parseInt(state.getTimeout(), 10));
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

const updateSelectHandler = (event) => {
  const targetForm = event.target.form;
  const formData = _.fromPairs([...new FormData(targetForm)]);
  state.setTimeout(parseInt(formData.updateTime, 10));
};


feedForm.addEventListener('submit', feedHandler);
resultsCont.addEventListener('click', handler);
updateTimeSelect.addEventListener('change', updateSelectHandler);

startFeedUpdater();
