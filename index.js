import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASS,
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkList(){
  const it= await db.query("SELECT id, title FROM items");
  let items=[];
  it.rows.forEach((item)=>{
    items.push({id:item.id, title:item.title});
  });
  return items;
}

app.get("/", async (req, res) => {
  try {
  let items = await checkList();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
} catch (err){
  console.log(err);
}
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try{
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/");
  } catch (err){
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  try{
    const updated= req.body.updatedItemTitle;
    const id= req.body.updatedItemId;
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [updated, id]);
    res.redirect("/");
  }catch (err){
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  try{
    const id= req.body.deleteItemId;
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  }catch (err){
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
