/*Developers Details:
 * Lidan Danino - 207599473
 * Niv Netanel - 208540302
 */
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// Importing the database connection
require("./models/database");
// Importing the router modules
const indexRouter = require("./routes/index");
const aboutRouter = require("./routes/about");

// Importing the required models and functions from the database module
const { createNewCost, createNewReport, Cost, Report, enumCategory, User } = require("./models/database");

// Initializing the express app
const app = express();

// Importing the developers details from the aboutRouter
const { developersDetails } = aboutRouter;

// Setting up the view engine and the views directory
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Initializing the arrays to store cost data for different categories
const resultArray = {
  food: [],
  transportation: [],
  health: [],
  housing: [],
  sport: [],
  education: [],
  other: [],
};

// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Router setup
app.use("/", indexRouter);

// Route for adding new costs
app.use("/addcost/", async function (req, res) {
  try {
    const category = req.body.category;
    // Check if the category is valid
    if (!enumCategory.includes(category)) {
      throw new Error("Invalid category");
    }
    const user_id = req.body.user_id;
    const existingUser = await User.findOne({ id: user_id });
    if (!existingUser) {
      throw new Error("User does not exist");
    }

    // Calling the createNewCost function to add a new cost
    const newCost = await createNewCost(req.body.user_id, req.body.day, req.body.month, req.body.year, req.body.description, req.body.category, req.body.sum);

    // Fetch the inserted cost document from the database
    const insertedCost = await Cost.findById(newCost._id);

    // Send the inserted cost document as the response
    res.json(insertedCost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route for getting the developers details
app.use("/about/", function (req, res) {
  // Sending the developers details
  res.send(developersDetails());
});

app.use("/report/", function (req, res) {
  new Promise(async (resolve, reject) => {
    let q = req.url.split("?"),
      result = {};
    splitUrl(q, result);
    let resultComputed = await Report.find({
      user_id: result.user_id,
      month: result.month,
      year: result.year,
    });
    // Check if a report with the given parameters exists
    if (resultComputed[0] != undefined) {
      console.log("Computed result");
      resultComputed.map((doc) =>
        resultArray[doc.category].push({
          day: doc.day,
          description: doc.description,
          sum: doc.sum,
        })
      );
      resolve({ resultArray });
    } else {
      let resultMatch = await Cost.find({
        user_id: result.user_id,
        month: result.month,
        year: result.year,
      });
      // Check if a cost with the given parameters exists
      if (resultMatch[0] != undefined) {
        console.log("Match result");
        resultMatch.map((doc) =>
          resultArray[doc.category].push({
            day: doc.day,
            description: doc.description,
            sum: doc.sum,
          })
        );
        resolve({ resultArray });
      } else {
        console.log("Empty result");
        resolve({ resultArray });
      }
    }
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(400).json({ error }));
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
