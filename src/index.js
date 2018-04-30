import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { isURL } from 'validator';
import _ from 'lodash';
import axios from 'axios';

let RssData = [];

const feedForm = document.getElementById('feed-form');
const resultsCont = document.getElementById('results');
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const parser = new DOMParser();
const addedFeeds = new Set();

const getNodeTagVal = (node, tag) => {
  const nd = node.getElementsByTagName(tag)[0];
  return nd.textContent;
};

const checkParseErr = (node) => {
  console.log(node);
  const nd = node.getElementsByTagName('parsererror');
  console.log(nd);
  return (!(nd.length === 0));
};

const parseHtmlCollection = (coll) => {
  const items = [...coll.getElementsByTagName('item')];
  const name = getNodeTagVal(coll, 'title');
  const description = getNodeTagVal(coll, 'description');
  const link = getNodeTagVal(coll, 'link');
  return {
    name,
    description,
    link,
    children: [items.map(el => parseHtmlCollection(el))],
  };
};

const renderFeedItem = (children) => {
  const result = children[0].map((child) => {
    const { name, link } = child;
    const template =
    `
    <li class="list-group-item"><a href="${link}">${name}</a></li>
    `;
    return template;
  });
  return result.join('\n');
};

const renderFeeds = (data) => {
  const result = data.map((el) => {
    const { name, description, children } = el;
    const template =
    `
    <div class="jumbotron">
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
  if (!(isURL(formData.feedUrl)) || addedFeeds.has(formData.feedUrl)) {
    input.classList.add('is-invalid');
  } else {
    addedFeeds.add(formData.feedUrl);
    input.classList.remove('is-invalid');
    const ulr = new URL(formData.feedUrl);
    axios(`${corsProxy}${ulr.host}${ulr.pathname}`, {
      method: 'GET',
    })
      .then((resp) => {
        const { data } = resp;
        const parsedData = parser.parseFromString(data, 'application/xml');
        if (!checkParseErr((parsedData))) {
          RssData = [...RssData, parseHtmlCollection(parsedData)];
          resultsCont.innerHTML = renderFeeds(RssData);
          input.value = '';
        } else {
          input.classList.add('is-invalid');
        }
      });
  }
};

feedForm.addEventListener('submit', feedHandler);
