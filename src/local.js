export const toStorage = (data) => {
  localStorage.setItem('aimmlRss', JSON.stringify(data));
};

export const getFromStorage = () => {
  return JSON.parse(localStorage.getItem('aimmlRss'));
};
