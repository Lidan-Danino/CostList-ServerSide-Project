/* Developers Details:
 * Lidan Danino - 207599473
 * Niv Netanel - 208540302
 */

const validDay = { type: Number, min: 1, max: 31 };
const validMonth = { type: Number, min: 1, max: 12 };
const validYear = { type: Number, min: 1900, max: 2100 };
const connection =
  "mongodb+srv://lidan05463:lidan12345@cluster0.e1xynie.mongodb.net/FinalProject?retryWrites=true&w=majority";

const enumCategory = [
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
mongoose.connect(connection, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => {
  console.error("Error connecting to MongoDB Atlas:", error);
});
db.once("open", () => {
  console.log("Successfully connected to MongoDB Atlas.");
});

const usersSchema = new mongoose.Schema(
  { id: Number, first_name: String, last_name: String, birthday: Date },
  { versionKey: false }
);

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

const User = mongoose.model("User", usersSchema);
const Cost = mongoose.model("Cost", costsSchema);
const Report = mongoose.model("Report", computedReportsSchema);

const user = new User({
  id: 123123,
  first_name: "moshe",
  last_name: "israeli",
  birthday: new Date(1990, 1, 10),
});

async function createUserIfNotExist(user) {
  let existUser = await User.findOne({ id: user.id });
  if (!existUser) {
    existUser = await User.create(user);
  }
  return existUser;
}

createUserIfNotExist(user).then(console.log);

async function createNewCost(
  costUserId,
  costDay,
  costMonth,
  costYear,
  costDescription,
  costCategory,
  costSum
) {
  const highestIdCost = await Cost.findOne().sort({ id: -1 }).limit(1);

  let newId = 1;
  if (highestIdCost) {
    newId = highestIdCost.id + 1;
  }

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

  return await cost.save();
}

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
    user_id: reportUserId,
    day: reportDay,
    month: reportMonth,
    year: reportYear,
    description: reportDescription,
    category: reportCategory,
    sum: reportSum,
  });
  await Report.create(report);
}

module.exports = {
  createNewCost,
  createNewReport,
  Cost,
  Report,
  enumCategory,
  User,
};
