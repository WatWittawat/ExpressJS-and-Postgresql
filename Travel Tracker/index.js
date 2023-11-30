import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "123456",
  port: 5432,
})

db.connect();

async function checkvisit() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let country = [];
  result.rows.forEach(data => {
    country.push(data.country_code);
  })
  return country;
}

app.get("/", async (req, res) => {
    const country = await checkvisit();
    res.render("index.ejs", {countries: country, total : country.length});
});

app.post("/add", async (req, res) => {
  const ans = req.body.country;
  try {
    const tmp = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';"
    ,[ans.toLowerCase()]);
    const data = tmp.rows[0];
    const usedata = data.country_code;
    try{
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [usedata]);
      res.redirect("/")
    } catch (e){
      console.log(e);
      const country = await checkvisit();
      res.render("index.ejs", {
        countries: country,
        total: country.length,
        error: "Country has already been added, try again.",
      });
    }
  }catch (e){
    console.log(e);
    const country = await checkvisit();
    res.render("index.ejs", {
      countries: country,
      total: country.length,
      error: "Country name does not exist, try again.",
    })
  }
})

  

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
