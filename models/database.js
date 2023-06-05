/*Developers Details:
 * Lidan Danino - 207599473
 * Niv Netanel - 208540302
 */

const crypto = require("crypto");
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const connection = "mongodb+srv://lidan05463:lidan12345@cluster0.e1xynie.mongodb.net/FinalProject?retryWrites=true&w=majority";

const enumCategory = ["food", "housing", "health", "sport", "education", "transportation", "other"];

const valid = {
  Day: { type: Number, min: 1, max: 31 },
  Month: { type: Number, min: 1, max: 12 },
  Year: { type: Number, min: 1900, max: 2100 },
};

const createSchemaFields = (additionalFields = {}) => ({
  user_id: {
    type: Number,
    required: true,
  },
  day: valid.Day,
  month: valid.Month,
  year: valid.Year,
  ...additionalFields,
});

const usersSchema = new mongoose.Schema({ id: Number, first_name: String, last_name: String, birthday: Date }, { versionKey: false });

const computedReportsSchema = new mongoose.Schema(
  createSchemaFields({
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
  }),
  { versionKey: false }
);

const costsSchema = new mongoose.Schema(
  createSchemaFields({
    id: {
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
  }),
  { versionKey: false }
);

const User = mongoose.model("User", usersSchema);
const Cost = mongoose.model("Cost", costsSchema);
const Report = mongoose.model("Report", computedReportsSchema);

const createUserIfNotExist = async (user) => {
  return User.findOne({ id: user.id }) || User.create(user);
};

const createNewEntry = async (Model, data) => {
  const entry = new Model(data);
  return await Model.create(entry);
};

async function createNewCost(costData) {
  return await createNewEntry(Cost, costData);
}

async function createNewReport(reportData) {
  return await createNewEntry(Report, reportData);
}

mongoose
  .connect(connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas.");

    const user = new User({
      id: 123123,
      first_name: "moshe",
      last_name: "israeli",
      birthday: new Date(1990, 1, 10),
    });

    createUserIfNotExist(user).then(console.log);
  })
  .catch((error) => console.error("Error connecting to MongoDB Atlas:", error));

const db = mongoose.connection;

db.on("error", (error) => console.error("Error connecting to MongoDB Atlas:", error));

module.exports = {
  createNewCost,
  createNewReport,
  Cost,
  Report,
  enumCategory,
  User,
};
