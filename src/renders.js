const htmlToElement = (html) => {
  const template = document.createElement('template');
  const appendedHtml = html.trim();
  template.innerHTML = appendedHtml;
  return template.content.firstChild;
};

export const htmlRender = (str, target) => {
  const renderTo = target;
  renderTo.innerHTML = str;
};

export const htmlAppendRender = (str, target) => {
  const renderTo = target;
  const element = htmlToElement(str);
  if (element) {
    renderTo.appendChild(element);
  }
};

export const renderFeedItems = (children) => {
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

export const renderFeed = (data, feedId) => {
  const feedData = data.filter(el => el.id === feedId)[0];
  const {
    name,
    description,
    children,
    id,
  } = feedData;
  const template =
    `
    <div class="tab-pane" id="${id}" role="tabpanel" aria-labelledby="v-pills-home-tab">
      <div class="jumbotron" data-uid='${id}'>
        <h2 class="display-5">${name}</h2>
        <p class="lead">${description}</p>
        <ul class="list-group feedContent">
          ${renderFeedItems(children)}
        </ul>
      </div>
    </div>
    `;
  return template;
};

export const renderTabControl = (data, feedId) => {
  const feedData = data.filter(el => el.id === feedId)[0];
  const { name, id } = feedData;
  const template =
  `
  <a class="nav-link" data-tab="${id}" data-toggle="pill" href="#${id}" role="tab" aria-controls="v-pills-home" aria-selected="true">${name}</a>
  `;
  return template;
};


export const renderAllFeeds = allData => allData.map(feed => renderFeed(allData, feed.id)).join('\n');

export const renderAllTabControls = allData => allData.map(feed => renderTabControl(allData, feed.id)).join('\n');
