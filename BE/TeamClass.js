class Team {
  constructor(name) {
    this.name = name;
    this.metrics = {}; // Object to store performance metrics
  }

  addMetric(metric, value) {
    this.metrics[metric] = value;
  }
}

class Match {
  constructor(homeTeam, awayTeam, result) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.result = result; // Object containing match result (e.g., goals scored, goals conceded)
  }
}

class TeamGraph {
  constructor() {
    this.teams = {}; // Object to store teams
    this.matches = []; // Array to store match objects
  }

  addTeam(teamName) {
    if (!this.teams[teamName]) {
      this.teams[teamName] = new Team(teamName);
    }
  }

  addMatch(homeTeam, awayTeam, result) {
    this.addTeam(homeTeam);
    this.addTeam(awayTeam);

    this.matches.push(new Match(homeTeam, awayTeam, result));
  }
}
let nouveauGraph = new TeamGraph();
nouveauGraph.addTeam("Tottenham Hotspur");
nouveauGraph.addTeam("Manchester United");
nouveauGraph.addTeam("Chelsea");
console.log(nouveauGraph);
module.exports = TeamGraph;
