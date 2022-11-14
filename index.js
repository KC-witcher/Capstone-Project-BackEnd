const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
const PORT = 3002;
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3002"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userID",
    secret: "secretSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

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

app.get("/api/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

// To log in
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM USER WHERE EMAIL_USER = ?;", email, (err, result) => {
    if (err) {
      res.status(500).send({
        success: false,
        error: `Could not retrieve the user with the email ${email}`,
      });
    }

    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (error, response) => {
        if (response) {
          req.session.user = result;
          console.log(req.session.user);
          res.send(result);
        } else {
          res.send({
            message: "Wrong username or password, please try again!",
          });
        }
      });
    } else {
      res.send({ message: "User doesn't exist" });
    }
  });
});

// For creating USER
app.post("/api/create", (req, res) => {
  const { email, password, fname, lname } = req.body;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }

    db.query(
      "INSERT INTO USER (EMAIL_USER, PASSWORD_USER, FNAME_USER, LNAME_USER) VALUES (?,?,?,?)",
      [email, hash, fname, lname],
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
});

// To update a USER
app.put("/api/update/:email", (req, res) => {
  const email = req.params.email;
  const { password, fname, lname } = req.body;

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
