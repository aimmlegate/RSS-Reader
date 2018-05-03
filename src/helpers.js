import md5 from 'md5';

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
  const guid = getNodeTagVal(coll, 'guid');
  return {
    id: md5(guid),
    guid,
    name,
    description,
    link,
    children: items.map(el => parseHtmlCollection(el)),
  };
};

const findUniq = (oldFeed, newFeed) => {
  const setOldFeed = new Set(oldFeed.map(el => el.guid));
  return newFeed.filter(el => !setOldFeed.has(el.guid));
};

const findInRss = (uid, data) => data.filter(el => el.id === uid)[0];

const normalizeUrl = url => url.trim().toLowerCase();

export { getNodeTagVal, checkParseErr, parseHtmlCollection, findInRss, normalizeUrl, findUniq };
