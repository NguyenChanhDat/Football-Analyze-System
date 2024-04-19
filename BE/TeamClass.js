class Team {
  constructor(name) {
    this.name = name;
    this.metrics = {}; // Object to store performance metrics
  }

  addMetric(metric, value) {
    this.metrics[metric] = value;
  }
}
class result {
  constructor(homeTeamGoal, awayTeamGoal) {
    this.homeTeamGoal = homeTeamGoal;
    this.awayTeamGoal = awayTeamGoal;
  }
}
class Match {
  constructor(firstTeam, secondTeam, result) {
    this.firstTeam = firstTeam;
    this.secondTeam = secondTeam;
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
      this.teams[teamName] = new Team(String(teamName));
    }
  }
  addMatch(firstTeam, secondTeam, fisrtTeamGoal, secondTeamGoal) {
    this.matches.push(
      new Match(
        firstTeam,
        secondTeam,
        new result(fisrtTeamGoal, secondTeamGoal)
      )
    );
  }
}
// let nouveauGraph = new TeamGraph();
// nouveauGraph.addTeam("Tottenham Hotspur");
// nouveauGraph.addTeam("Manchester United");
// nouveauGraph.addTeam("Chelsea");
// nouveauGraph.addTeam("Manchester City");
// nouveauGraph.addMatch("Chelsea", "Manchester United", 4, 3);
// nouveauGraph.addMatch("Manchester United", "Manchester City", 1, 3);

// console.log(nouveauGraph);
// for (let i = 0; i < nouveauGraph.matches.length; i++) {
//   console.log(nouveauGraph.matches[i].result);
// }

module.exports = TeamGraph;
