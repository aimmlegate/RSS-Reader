import uuid from 'uuid/v4';

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

const normalizeUrl = url => url.trim().toLowerCase();

export { getNodeTagVal, checkParseErr, parseHtmlCollection, findInRss, normalizeUrl };
