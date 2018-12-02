import mongoose from "mongoose";

const host = process.env.MONGO_HOST || "mongodb";
const port = process.env.MONGO_PORT || 27017;
const database = process.env.MONGO_DB || "users";
const user = process.env.MONGO_USER || "";
const password = process.env.MONGO_PW || "";
const credentials = user && password ? `${user}:${password}@` : "";
const mongodb = `mongodb://${credentials}${host}:${port}/${database}`;

mongoose.connect(
  mongodb,
  { useNewUrlParser: true }
);

mongoose.Promise = global.Promise; // look this up

const client = mongoose.connection;

client.on("open", () => {
  console.log(":: MongoDB client connected with " + mongodb);
});

client.on("error", err => {
  console.log(":: Something went wrong " + err);
});

export default {
  init() {}
};
