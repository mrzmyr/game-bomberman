class Client {
  constructor() {
    let clientId = localStorage.getItem('clientId');

    if(!clientId) {
      clientId = uuid();
      localStorage.setItem('clientId', clientId);
    }

    this.id = clientId;
  }
}

