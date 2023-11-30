import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "TodoList",
  password: "123456",
  port: 5432,
})

db.connect();

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  const tmp = await db.query("SELECT * FROM item")
  items = tmp.rows
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("INSERT INTO item(title) VALUES ($1)", [item])
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemId
  const text = req.body.updatedItemTitle
  await db.query(
    "UPDATE item SET title = ($1) WHERE item.id = ($2)", [text,item])
  res.redirect("/")
});

app.post("/delete", async (req, res) => {
  const item = req.body.deleteItemId
  await db.query(
    "DELETE FROM item WHERE item.id = ($1)", [item]
  )
  res.redirect("/")
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
