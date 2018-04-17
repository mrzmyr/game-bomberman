class Client {
  constructor(username) {
    let id = localStorage.getItem('clientId');

    localStorage.setItem('clientUsername', username)

    if(!id) {
      id = uuid();
      localStorage.setItem('clientId', id);
    }

    this.id = id;
    this.username = username;
  }
}

