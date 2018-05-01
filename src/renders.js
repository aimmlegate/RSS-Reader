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

export { renderFeedItem, renderFeeds };
