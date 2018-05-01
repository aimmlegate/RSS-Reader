import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { isURL } from 'validator';
import _ from 'lodash';
import axios from 'axios';
import state from './state';
import { renderFeeds } from './renders';
import { checkParseErr, parseHtmlCollection, findInRss, normalizeUrl } from './helpers';

const feedForm = document.getElementById('feed-form');
const resultsCont = document.getElementById('results');
const errMessage = document.getElementById('error-message');
const modalDescription = document.getElementById('modal-description');
const input = document.querySelector('#feed-input');
const corsProxy = 'http://cors-proxy.htmldriven.com';
const parser = new DOMParser();

const htmlRender = (str) => {
  input.value = '';
  resultsCont.innerHTML = str;
};

const getAjaxData = (url, cors) => {
  const proxyUrl = new URL('/?url=', cors);
  const newUrl = normalizeUrl(url);
  axios.get(new URL(`${proxyUrl.href}${newUrl}`), { timeout: 10000 })
    .then((resp) => {
      const { body } = resp.data;
      const parsedData = parser.parseFromString(body, 'application/xml');
      if (!checkParseErr((parsedData))) {
        state.addData(parseHtmlCollection(parsedData));
        state.newFeed(newUrl);
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
        htmlRender(renderFeeds(state.getData()));
      }
    })
    .catch((err) => {
      state.setFormError('Network error');
      input.classList.add('is-invalid');
      errMessage.textContent = state.getFormMessage();
    });
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
    getAjaxData(formData.feedUrl, corsProxy);
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

feedForm.addEventListener('submit', feedHandler);

resultsCont.addEventListener('click', handler);
