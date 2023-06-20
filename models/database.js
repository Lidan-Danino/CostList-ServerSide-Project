/* Developers Details:
 * Lidan Danino - 207599473
 * Niv Netanel - 208540302
 */

// Define valid ranges for day, month, and year
const validDay = { type: Number, min: 1, max: 31 };
const validMonth = { type: Number, min: 1, max: 12 };
const validYear = { type: Number, min: 1900, max: 2100 };

// Connection string for MongoDB Atlas
const connection =
  "mongodb+srv://lidan05463:lidan12345@cluster0.e1xynie.mongodb.net/FinalProject?retryWrites=true&w=majority";

// Define an array of valid categories
const enumCategory = [
  "food",
  "housing",
  "health",
  "sport",
  "education",
  "transportation",
  "other",
];

// Require the 'crypto' module
let crypto = require("crypto");

// Require the 'mongoose' module and establish a connection to MongoDB Atlas
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
mongoose.connect(connection, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => {
  console.error("Error connecting to MongoDB Atlas:", error);
});
db.once("open", () => {
  console.log("Successfully connected to MongoDB Atlas.");
});

// Define the schema for the 'User' model
const usersSchema = new mongoose.Schema(
  { id: Number, first_name: String, last_name: String, birthday: Date },
  { versionKey: false }
);

// Define the schema for the 'Report' model
const computedReportsSchema = new mongoose.Schema(
  {
    user_id: {
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

// Define the schema for the 'Cost' model
const costsSchema = new mongoose.Schema(
  {
    user_id: {
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
    id: {
      type: Number,
      unique: true,
      default: 1,
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

// Create the 'User' model using the 'usersSchema'
const User = mongoose.model("User", usersSchema);

// Create the 'Cost' model using the 'costsSchema'
const Cost = mongoose.model("Cost", costsSchema);

// Create the 'Report' model using the 'computedReportsSchema'
const Report = mongoose.model("Report", computedReportsSchema);

// Create a new user instance
const user = new User({
  id: 123123,
  first_name: "moshe",
  last_name: "israeli",
  birthday: new Date(1990, 1, 10),
});

// Function to create a user if it doesn't exist
async function createUserIfNotExist(user) {
  let existUser = await User.findOne({ id: user.id });
  if (!existUser) {
    existUser = await User.create(user);
  }
  return existUser;
}

// Call the createUserIfNotExist function with the user instance and log the result
createUserIfNotExist(user).then(console.log);

// Function to create a new cost
async function createNewCost(
  costUserId,
  costDay,
  costMonth,
  costYear,
  costDescription,
  costCategory,
  costSum
) {
  // Find the cost with the highest ID
  const highestIdCost = await Cost.findOne().sort({ id: -1 }).limit(1);

  let newId = 1;
  if (highestIdCost) {
    newId = highestIdCost.id + 1;
  }

  // Create a new cost instance
  const cost = new Cost({
    user_id: costUserId,
    day: costDay,
    month: costMonth,
    year: costYear,
    id: newId,
    description: costDescription,
    category: costCategory,
    sum: costSum,
  });

  // Save the new cost
  return await cost.save();
}

// Function to create a new report
async function createNewReport(
  reportUserId,
  reportDay,
  reportMonth,
  reportYear,
  reportDescription,
  reportCategory,
  reportSum
) {
  // Create a new report instance
  const report = new Report({
    user_id: reportUserId,
    day: reportDay,
    month: reportMonth,
    year: reportYear,
    description: reportDescription,
    category: reportCategory,
    sum: reportSum,
  });

  // Save the new report
  await Report.create(report);
}

// Export the required functions, models, and variables
module.exports = {
  createNewCost,
  createNewReport,
  Cost,
  Report,
  enumCategory,
  User,
};
