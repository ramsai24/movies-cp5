const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const path = require("path");

app.use(express.json());

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

const convertSankeToCamel = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertSankeToCamel1 = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const sqlQuery = `SELECT movie_name  FROM movie;`;

  const moviesList = await db.all(sqlQuery);
  response.send(
    moviesList.map((item) => {
      return convertSankeToCamel1(item);
    })
  );
});

//  moviesList.map((dbObjects) => {
//       convertSankeToCamel1(dbObjects);  //no return is mentioned so null value are returned hence wrong response has sent
//     }

//API 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  //const { directorId, movieName, leadActor } = movieDetails;

  const sqlQuery = `
  INSERT INTO 
    movie (director_id, movie_name, lead_actor)
  VALUES (
      ${directorId},
      '${movieName}',
      '${leadActor}'

  ); `;
  const updated = await db.run(sqlQuery);
  console.log({ movieId: updated.lastID });
  response.send(`Movie Successfully Added`);
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);

  const sqlQuery = `
  SELECT * 
  FROM movie 
  WHERE movie_id = ${movieId};`;

  const data = await db.get(sqlQuery);
  response.send(convertSankeToCamel(data));
});

//API 4
app.put("/movies/:moviesId/", async (request, response) => {
  const { moviesId } = request.params;
  console.log(moviesId);

  const { directorId, movieName, leadActor } = request.body;

  const sqlQuery = `
     UPDATE 
        movie 
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}';
    WHERE 
        movie_id = ${moviesId}`;

  await db.run(sqlQuery);

  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);

  const sqlQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};`;

  await db.run(sqlQuery);
  response.send("Movie Removed");
});

const convertSankeToCamelDirectorsTable = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API 6
app.get("/directors/", async (request, response) => {
  const sqlQuery = `
    SELECT * FROM director;`;

  const directorList = await db.all(sqlQuery);

  response.send(
    directorList.map((dbObjects) =>
      convertSankeToCamelDirectorsTable(dbObjects)
    )
  );
});

const convertCamelToSankeMoviesList = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  console.log(directorId);

  const sqlQuery = `
  SELECT movie_name 
  FROM movie
  WHERE director_id = ${directorId};`;

  const moviesList = await db.all(sqlQuery);

  response.send(
    moviesList.map((dbObjects) => convertCamelToSankeMoviesList(dbObjects))
  );
});

module.exports = app;
