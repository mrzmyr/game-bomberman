module.exports = class PlayerStatistics {
  constructor() {
    this.stats = {}
  }

  add(clientId) {
    this.stats[clientId] = {
      dies: 0,
      kills: 0
    }
  }

  remove(clientId) {
    delete this.stats[clientId];
  }

  increaseKills(clientId) {
    this.stats[clientId].kills += 1;
  }

  increaseDies(clientId) {
    this.stats[clientId].dies += 1;
  }

  get(clientId) {
    return this.stats[clientId];
  }
}