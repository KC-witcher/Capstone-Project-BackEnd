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
      res.status(500).send({
        success: false,
        error: `Could not retrieve the users`,
      });
    }
    res.send({
      success: true,
      result: result,
    });
  });
});

// To get one USER
app.get("/api/getFromEmail/:email", (req, res) => {
  const email = req.params.email;
  db.query("SELECT * FROM USER WHERE EMAIL_USER = ?", email, (err, result) => {
    if (err) {
      res.status(500).send({
        success: false,
        error: `Could not retrieve the user with the email ${email}`,
      });
    }
    res.send({
      success: true,
      result: result,
    });
  });
});

// To log in
app.post("/api/login", (req, res) => {
  const email = req.params.email;
  const password = req.params.password;

  db.query("SELECT * FROM USER WHERE EMAIL_USER = ? AND PASSWORD_USER = ?", [email, password], (err, result) => {
    if (err) {
      res.status(500).send({
        success: false,
        error: `Could not retrieve the user with the email ${email} and thier password`,
      });
    }

    if (result.length > 0) {
      res.send({
        success: true,
        result: result,
      });
      }else({message: "Wrong username or password, please try again!"});
  }
  );
});

// For creating USER
app.post("/api/create", (req, res) => {
  const { email, password, fname, lname } = req.body;

  db.query(
    "INSERT INTO USER (EMAIL_USER, PASSWORD_USER, FNAME_USER, LNAME_USER) VALUES (?,?,?,?)",
    [email, password, fname, lname],
    (err, result) => {
      if (err) {
        res.status(500).send({
          success: false,
          error: `User ${fname} ${lname} was not added`,
        });
      }
      res.send({
        success: true,
        result: result,
      });
    }
  );
});

// To update a USER
app.post("/api/update/:email", (req, res) => {
  const { email, password, fname, lname } = req.body;

  db.query(
    "UPDATE USER SET FNAME_USER = ?, LNAME_USER = ? WHERE EMAIL_USER = ? AND PASSWORD_USER = ?",
    [fname, lname, email, password],
    (err, result) => {
      if (err) {
        res.status(500).send({
          success: false,
          result: `Could not update the user with email: ${email}`,
        });
      }
      res.send({
        success: true,
        result: result,
      });
    }
  );
});

// To delete a USER
app.delete("/api/delete/:email", (req, res) => {
  const email = req.params.email;

  db.query("DELETE FROM USER WHERE EMAIL_USER= ?", email, (err, result) => {
    if (err) {
      res.status(500).send({
        success: false,
        error: `Could not delete the user with email ${email}`,
      });
    }
    res.send({
      success: true,
      result: result,
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
