// let over = {
//   height: 200,
//   weight: 189,
//   name: "stupid",
//   condition: true,
// };
// for (var i in over) {
//   console.log(i + ": " + over[i]);
// }
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

// Example usage:

const graph = new TeamGraph();

// Adding teams
graph.addTeam("Manchester United");
graph.addTeam("Liverpool");
graph.addTeam("Chelsea");

// Adding matches
graph.addMatch("Manchester United", "Liverpool", {
  homeGoals: 2,
  awayGoals: 1,
});
graph.addMatch("Liverpool", "Chelsea", { homeGoals: 1, awayGoals: 0 });
graph.addMatch("Chelsea", "Manchester United", { homeGoals: 0, awayGoals: 2 });

console.log(graph);
