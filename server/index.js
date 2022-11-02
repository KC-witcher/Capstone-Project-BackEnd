const express = require("express");
const db = require("./config/db");
const cors = require("cors");

const app = express();

const PORT = 3002;
app.use(cors());
app.use(express.json());

// Route to get all users
app.get("/api/get", (req, res) => {
  db.query("SELECT * FROM USER", (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

// Route to get one user
app.get("/api/getFromId/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM USER WHERE id = ?", id, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

// Route for creating the user
app.post("/api/create", (req, res) => {
  const userEmail = req.body.userEmail;
  const userPassword = req.body.userPassword;
  const fName = req.body.fName;
  const lName = req.body.lName;

  console.log(userEmail, userPassword, fName, lName);

  db.query(
    "INSERT INTO posts (EMAIL_USER, PASSWORD_USER, FNAME_USER, LNAME_USER) VALUES (?,?,?,?)",
    [userEmail, userPassword, fName, lName],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(result);
    }
  );
});

// Route to delete a user
app.delete("/api/delete/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM USER WHERE id= ?", id, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
