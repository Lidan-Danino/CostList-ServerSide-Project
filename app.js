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
app.use(logger("dev")); // setup logger middleware for logging HTTP requests
app.use(express.json()); // use express.json middleware for parsing JSON request bodies
app.use(express.urlencoded({ extended: false })); // use express.urlencoded middleware for parsing URL-encoded bodies
app.use(cookieParser()); // setup cookie-parser middleware for parsing cookie headers and populating req.cookies
app.use(express.static(path.join(__dirname, "public"))); // setup express.static middleware to serve static files from the public directory

// Router setup
app.use("/", indexRouter);

// Route for adding new costs
app.use("/addcost/", function (req, res) {
  // Wrapping the add cost logic in a Promise
  new Promise(async (resolve, reject) => {
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
      // Resolving the promise with the new cost
      resolve(newCost);
    } catch (e) {
      // Rejecting the promise with an error message
      reject(e.message);
    }
  })
    .then((newCost) => res.json(newCost)) // Sending the new cost as a response
    .catch((error) => res.status(400).json({ error }));
});

// Route for getting the developers details
app.use("/about/", function (req, res) {
  // Sending the developers details
  res.send(developersDetails());
});

app.use("/report/", async function (req, res, next) {
  try {
    let q = req.url.split("?"),
      result = {};
    splitUrl(q, result);

    const user_id = result.user_id;
    const existingUser = await User.findOne({ id: user_id });
    if (!existingUser) {
      return res.status(400).json({ error: "User does not exist" });
    }

    let resultComputed = await Report.find({ user_id: result.user_id, month: result.month, year: result.year });

    if (resultComputed[0] != undefined) {
      console.log("Computed result");
      resultComputed.map((doc) => resultArray[doc.category].push({ day: doc.day, description: doc.description, sum: doc.sum }));
      res.status(200).json(resultArray);
    } else {
      let resultMatch = await Cost.find({ user_id: result.user_id, month: result.month, year: result.year });
      resultMatch.map((doc) => resultArray[doc.category].push({ day: doc.day, description: doc.description, sum: doc.sum }));

      try {
        monthValidate(result.month);
        yearValidate(result.year);
        resultMatch.map((doc) => {
          createNewReport(doc.user_id, doc.day, doc.month, doc.year, doc.description, doc.category, doc.sum);
        });
        res.status(200).json(resultArray);
      } catch (err) {
        // Return error if invalid
        res.status(500).json({ error: "Invalid date" });
      }
    }
  } catch (error) {
    next(error);
  } finally {
    clearArrays();
  }
});

// Function to split the URL
function splitUrl(url, result) {
  if (url.length >= 2) {
    // Split the URL by '&' and add each parameter to the result object
    url[1].split("&").forEach((item) => {
      try {
        result[item.split("=")[0]] = item.split("=")[1];
      } catch (e) {
        result[item.split("=")[0]] = "";
      }
    });
  }
}

function monthValidate(currentMonth) {
  if (!(currentMonth >= 1 && currentMonth <= 12)) {
    throw new Error("Month not valid");
  }
}

// Function to validate the year
function yearValidate(currentYear) {
  if (!(currentYear >= 1900 && currentYear <= 2100)) {
    throw new Error("Year not valid");
  }
}

function clearArrays() {
  for (const array in resultArray) {
    resultArray[array].length = 0;
  }
}

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
