import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { isURL } from 'validator';
import _ from 'lodash';
import axios from 'axios';
import uuid from 'uuid/v4';


let RssData = [];

const feedForm = document.getElementById('feed-form');
const resultsCont = document.getElementById('results');
const errMessage = document.getElementById('error-message');
const modalDescription = document.getElementById('modal-description');
const corsProxy = 'https://cors-anywhere.herokuapp.com';
const parser = new DOMParser();
const addedFeeds = new Set();

const getNodeTagVal = (node, tag) => {
  const nd = node.getElementsByTagName(tag)[0];
  return nd.textContent;
};

const checkParseErr = (node) => {
  const nd = node.getElementsByTagName('parsererror');
  return (!(nd.length === 0));
};

const parseHtmlCollection = (coll) => {
  const items = [...coll.getElementsByTagName('item')];
  const name = getNodeTagVal(coll, 'title');
  const description = getNodeTagVal(coll, 'description');
  const link = getNodeTagVal(coll, 'link');
  return {
    id: uuid(),
    name,
    description,
    link,
    children: items.map(el => parseHtmlCollection(el)),
  };
};

const findInRss = (uid, data) => data.filter(el => el.id === uid)[0];

const renderFeedItem = (children) => {
  const result = children.map((child) => {
    const { name, link, id } = child;
    const template =
    `
    <li class="list-group-item d-flex justify-content-between align-items-center" data-uid='${id}'>
      <a href="${link}">${name}</a><button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#exampleModalLive">Info</button>
    </li>
    `;
    return template;
  });
  return result.join('\n');
};

const renderFeeds = (data) => {
  const result = data.map((el) => {
    const {
      name,
      description,
      children,
      id,
    } = el;
    const template =
    `
    <div class="jumbotron" data-uid='${id}'>
      <h2 class="display-5">${name}</h2>
      <p class="lead">${description}</p>
      <ul class="list-group">
        ${renderFeedItem(children)}
      </ul>
    </div>
    `;
    return template;
  });
  return result.join('\n');
};

const feedHandler = (event) => {
  event.preventDefault();
  const { target } = event;
  const input = target.querySelector('#feed-input');
  const formData = _.fromPairs([...new FormData(target)]);
  if (!(isURL(formData.feedUrl))) {
    input.classList.add('is-invalid');
    errMessage.textContent = 'Invalid URL';
  } else if (addedFeeds.has(formData.feedUrl)) {
    input.classList.add('is-invalid');
    errMessage.textContent = 'Feed already exist';
  } else {
    input.classList.remove('is-invalid');
    const proxyUrl = new URL('/', corsProxy);
    const ulr = new URL(formData.feedUrl.trim().toLowerCase());
    axios.get(new URL(`${ulr.host}${ulr.pathname}`, proxyUrl), { timeout: 10000 })
      .then((resp) => {
        const { data } = resp;
        const parsedData = parser.parseFromString(data, 'application/xml');
        if (!checkParseErr((parsedData))) {
          RssData = [...RssData, parseHtmlCollection(parsedData)];
          resultsCont.innerHTML = renderFeeds(RssData);
          input.value = '';
          addedFeeds.add(formData.feedUrl);
        } else {
          input.classList.add('is-invalid');
          errMessage.textContent = 'Parsing error';
        }
      })
      .catch((err) => {
        input.classList.add('is-invalid');
        errMessage.textContent = 'Network error';
        console.error(err);
      });
  }
};

const handler = (event) => {
  const { target } = event;
  if (target.dataset.toggle === 'modal') {
    const parent = target.parentElement;
    const mainParent = parent.closest('.jumbotron');
    const itemUid = parent.dataset.uid;
    const feedUid = mainParent.dataset.uid;
    const feed = findInRss(feedUid, RssData);
    const { description } = findInRss(itemUid, feed.children);
    modalDescription.textContent = description;
    $('#descriptionModal').modal('toggle');
  }
};

feedForm.addEventListener('submit', feedHandler);

resultsCont.addEventListener('click', handler);
