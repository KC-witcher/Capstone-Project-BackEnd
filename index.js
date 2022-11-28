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
    origin: true,
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

// UserID is saved in session.
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

// app.get("/api/login", (req, res) => {
//   if (req.session.user) {
//     res.send({ loggedIn: true, user: req.session.user });
//   } else {
//     res.send({ loggedIn: false });
//   }
// });

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

    if (result.length) {
      bcrypt.compare(password, result[0].PASSWORD_USER, (error, response) => {
        if (response) {
          req.session.user = result;
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

// Gets First Name and Last Name of user.
app.get("/api/getNames/:id", (req, res) => {
  const user_id = req.params.id;
  db.query(
    "SELECT FNAME_USER, LNAME_USER FROM USER WHERE ID_USER = ?",
    user_id,
    (err, result) => {
      if (err) {
        res.status(500).send({
          success: false,
          error: `Could not get user's first name and last name.`,
        });
      }
      res.send({
        success: true,
        result: result,
      });
    }
  );
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
  const { email } = req.params;
  const { fname, lname } = req.body;

  db.query(
    "UPDATE USER SET FNAME_USER = ?, LNAME_USER = ? WHERE EMAIL_USER = ?",
    [fname, lname, email],
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

// To create a PROJECT for a given user.
app.post("/api/createProject/:id", (req, res) => {
  // Get logged-in user id from here.
  const user_id = req.params.id;

  const {
    type,
    length,
    priority,
    budget,
    value,
    quality,
    numOfPeople,
    start,
    end,
    goal,
    whenWork,
    timeWork,
    dayWork,
    level,
  } = req.body;

  db.query(
    "INSERT INTO PROJECT (TYPE_PROJECT, LENGTH_PROJECT, PRIORITY_PROJECT, BUDGET_PROJECT, VALUE_PROJECT, QUALITY_PROJECT, NUMPEOPLE_PROJECT, START_PROJECT, END_PROJECT,  GOAL_PROJECT, WHENWORK_PROJECT, TIMEWORK_PROJECT, DAYWORK_PROJECT, LEVEL_PROJECT, ID_USER_FK) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      type,
      length,
      priority,
      budget,
      value,
      quality,
      numOfPeople,
      start,
      end,
      goal,
      whenWork,
      timeWork,
      dayWork,
      level,
      user_id,
    ],
    (err, result) => {
      if (err) {
        console.log(err),
          res.status(500).send({
            success: false,
            error: `Project ${type} was not added`,
          });
      }
      res.send({
        success: true,
        result: result,
      });
    }
  );
});

// To get a user's PROJECT of a given user.
app.get("/api/getProject/:id", (req, res) => {
  const user_id = req.params.id;
  console.log(session.key);
  db.query(
    "SELECT * FROM PROJECT WHERE ID_USER_FK = ?",
    user_id,
    (err, result) => {
      if (err) {
        console.log(err),
          res.status(500).send({
            success: false,
            error: "Could not select projects for a given user.",
          });
      }
      res.send({
        success: true,
        result: result,
      });
    }
  );
});

// For development
app.get("/api/getProject", (req, res) => {
  db.query("SELECT * FROM PROJECT", (err, result) => {
    if (err) {
      console.log(err),
        res.status(500).send({
          success: false,
          error: "Could not select projects for a given user.",
        });
      }
      res.send({
        success: true,
        result: result,
      });

    }
  );
});

// To delete a PROJECT with given user.
app.delete("/api/deleteProject/:id", (req, res) => {
  const projectID = req.params.id;
  const user_id = session.key;

  db.query(
    "DELETE FROM PROJECT WHERE ID_PROJECT= ? AND ID_USER_FK = ?",
    projectID,
    user_id,
    (err, result) => {
      if (err) {
        res.status(500).send({
          success: false,
          error: `Could not delete the project`,
        });
      }
      res.send({
        success: true,
        result: result,
      });
    }
  );
});

// // Gets First Name for home page.
// app.get("/api/homeName", (req, res) => {
//   const user_id = session.key;

//   db.query(
//     "SELECT FNAME_USER FROM USER WHERE ID_USER = ?",
//     user_id,
//     (err, result) => {
//       if (err) {
//         res.status(500).send({
//           success: false,
//           error: `Could not get user's first name.`,
//         });
//       }
//       res.send({
//         success: true,
//         result: result,
//       });
//     }
//   );
// });

// Change first and last name of user
app.post("/api/updateNames", (req, res) => {
  const user_id = session.key;
  const { fname, lname } = req.body;

  db.query(
    "UPDATE USER SET USER_FNAME = ?, USER_LNAME = ? WHERE USER_ID = ?",
    fname,
    lname,
    user_id,
    (err, result) => {
      if (err) {
        res.status(500).send({
          success: false,
          error: `Could not update user's first and last name.`,
        });
      }
      res.send({
        success: true,
        result: result,
      });
    }
  );
});

// For creating SCHEDULE
app.post("/api/createSchedule/:id", (req, res) => {
  const proj_id = req.params.id;
  const { accepted, schedule_string } = req.body;

  db.query(
    "INSERT INTO SCHEDULE (ACCEPTED_SCHEDULE, CALENDAR_SCHEDULE, ID_PROJECT) VALUES (?,?,?)",
    [accepted, schedule_string, proj_id],
    (err, result) => {
      if (err) {
        res.status(500).send({
          success: false,
          error: `Schedule was not added.`,
        });
      }
      res.send({
        success: true,
        result: result,
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
