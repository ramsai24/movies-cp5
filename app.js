const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
console.log(dbPath);
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1

app.get("/movies/", async (request, response) => {
  const sqlQuery = `SELECT movie_name FROM movie;`;

  const moviesList = await db.all(sqlQuery);
  response.send(moviesList);
});

//API 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  //const { directorId, movieName, leadActor } = movieDetails;

  const sqlQuery = `
  INSERT INTO 
    movie (director_id, movie_name, lead_actor)
  VALUES (
      '${directorId}',
      '${movieName}',
      '${leadActor}

  ); `;
  const updated = await db.run(sqlQuery);
  //console.log({ movieId: updated.lastID });
  response.send(`Movie Successfully Added`);
});
