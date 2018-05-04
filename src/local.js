export const toStorage = data => localStorage.setItem('aimmlRss', JSON.stringify(data));

export const getFromStorage = () => JSON.parse(localStorage.getItem('aimmlRss'));

