/*Developers Details:
 * Lidan Danino - 207599473
 * Niv Netanel - 208540302
 */
// validDay, validMonth and validYear are objects that define the validation criteria for day,
validDay = { type: Number, min: 1, max: 31 };
validMonth = { type: Number, min: 1, max: 12 };
validYear = { type: Number, min: 1900, max: 2100 };

// enumCategory is an array of the possible categories for a cost.
enumCategory = [
  "food",
  "housing",
  "health",
  "sport",
  "education",
  "transportation",
  "other",
];

let crypto = require("crypto");
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const connection =
  "mongodb+srv://lidan05463:lidan12345@cluster0.e1xynie.mongodb.net/";
mongoose.connect(connection, { useNewUrlParser: true });
const db = mongoose.connection;
// Logging any errors that occur when connecting to the database.
db.on("error", (error) => {
  console.error("Error connecting to MongoDB Atlas:", error);
});
// Logging a success message once the connection is established.
db.once("open", () => {
  console.log("Successfully connected to MongoDB Atlas.");
});

// Creating schemas for the User, Costs and Reports collections.
const usersSchema = new mongoose.Schema(
  { userID: String, firstName: String, lastName: String, birthday: Date },
  { versionKey: false }
);

const computedReportsSchema = new mongoose.Schema(
  {
    userID: {
      type: Number,
      required: true,
    },
    day: {
      type: Number,
      required: false,
      min: validDay.min,
      max: validDay.max,
    },
    month: {
      type: Number,
      required: false,
      min: validMonth.min,
      max: validMonth.max,
    },
    year: {
      type: Number,
      required: false,
      min: validYear.min,
      max: validYear.max,
    },
    category: {
      type: String,
      enum: enumCategory,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sum: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false }
);

const costsSchema = new mongoose.Schema(
  {
    userID: {
      type: Number,
      required: true,
    },
    day: {
      type: Number,
      required: false,
      min: validDay.min,
      max: validDay.max,
    },
    month: {
      type: Number,
      required: false,
      min: validMonth.min,
      max: validMonth.max,
    },
    year: {
      type: Number,
      required: false,
      min: validYear.min,
      max: validYear.max,
    },
    userID: {
      type: String,
      unique: true,
      default: () => {
        return crypto.randomUUID();
      },
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: enumCategory,
      required: true,
    },
    sum: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false }
);

// Define Mongoose models for User, Cost, and Report
const User = mongoose.model("User", usersSchema);
const Cost = mongoose.model("Cost", costsSchema);
const Report = mongoose.model("Report", computedReportsSchema);

// Create a new User instance
const user = new User({
  userID: "123123",
  firstName: "Moshe",
  lastName: "Israeli",
  birthday: new Date(1990, 1, 10),
});

// Function to create a new User if they do not already exist
async function createUserIfNotExist(user) {
  // Check if a User with the same ID already exists
  const existUser = await User.findOne({ userID: user.userID });
  // Create the new User if they do not already exist
  if (existUser === null) {
    const newUser = await User.create(user);
    return newUser;
  }
}

// Call the createUserIfNotExist function and log the result to the console
createUserIfNotExist(user).then(console.log);

// Function to create a new Cost
async function createNewCost(
  costUserId,
  costDay,
  costMonth,
  costYear,
  costDescription,
  costCategory,
  costSum
) {
  const cost = new Cost({
    userID: costUserId,
    day: costDay,
    month: costMonth,
    year: costYear,
    description: costDescription,
    category: costCategory,
    sum: costSum,
  });
  await Cost.create(cost);
}
// Function to create a new Report
async function createNewReport(
  reportUserId,
  reportDay,
  reportMonth,
  reportYear,
  reportDescription,
  reportCategory,
  reportSum
) {
  const report = new Report({
    userID: reportUserId,
    day: reportDay,
    month: reportMonth,
    year: reportYear,
    description: reportDescription,
    category: reportCategory,
    sum: reportSum,
  });
  await Report.create(report);
}
// Export the three models and two functions as a module
module.exports = { createNewCost, createNewReport, Cost, Report };
