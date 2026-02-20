export function getSessionCache(key) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  
  export function setSessionCache(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
  