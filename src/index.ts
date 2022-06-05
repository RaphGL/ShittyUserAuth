import bcrypt from "bcryptjs";
import express from "express";
import sqlite3 from "sqlite3";
import path from "path";

const app = express();
const port = 3000;
const db = new sqlite3.Database("users.sqlite3");

app.use(express.json());
app.use(express.urlencoded());

// create database if it doesn't exist
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users(username text,password text,salt text );"
  );
});

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "/pages/index.html"));
});

app.get("/register", (_, res) => {
  res.sendFile(path.join(__dirname, "/pages/register.html"));
});

app.post("/register", (req, res) => {
  const salt = bcrypt.genSaltSync();
  const username = req.body.username;
  const password = bcrypt.hashSync(req.body.password, salt);
  db.run(
    `
    INSERT INTO users (username, password, salt)
    VALUES ($username, $password, $salt);
    `,
    username,
    password,
    salt
  );
  res.statusCode = 200;
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "/pages/login.html"));
});

app.post("/login", (req, res) => {
  let username: string, password: string, salt: string;
  db.get(
    `
    SELECT username, password, salt FROM users WHERE username = ?`,
    req.body.username,
    (_, row: any) => {
      const salted_password = bcrypt.hashSync(req.body.password, row.salt);
      if (salted_password == row.password) {
        res.send(showUserHomePage(req.body.username));
      } else {
        res.sendStatus(400);
      }
    }
  );
});

function showUserHomePage(username: string) {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login to your account</title>
</head>
<body>
    <h3>Welcome back, ${username}</h3>
    <p>This is your personal feed</p>
</body>
</html>
    `;
}

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}/`);
});
