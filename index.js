const express = require("express");
const db = require("./config/db");
const cors = require("cors");

const app = express();
const PORT = 3002;
app.use(cors());
app.use(express.json());

// To get all USER
app.get("/api/get", (req, res) => {
  db.query("SELECT * FROM USER", (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

// To get one USER
app.get("/api/getFromEmail/:email", (req, res) => {
  const email = req.params.email;
  db.query("SELECT * FROM EMAIL WHERE EMAIL_USER = ?", email, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

// For creating USER
app.post("/api/create", (req, res) => {
  const { email, password, fname, lname } = req.body;

  db.query(
    "INSERT INTO USER (EMAIL_USER, PASSWORD_USER, FNAME_USER, LNAME_USER) VALUES (?,?,?,?)",
    [email, password, fname, lname],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(result);
    }
  );
});

// To delete a USER

app.delete("/api/delete/:email", (req, res) => {
  const email = req.params.email;

  db.query("DELETE FROM USER WHERE EMAIL_USER= ?", email, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.log(`User with email ${email} was deleted`);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
