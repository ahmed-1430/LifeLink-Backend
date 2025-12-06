const { MongoClient, ServerApiVersion } = require("mongodb");

let db;

const connectDB = async () => {
  if (db) return db;

  const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  db = client.db("LifeLink"); // this is my DB name
  console.log("MongoDB Connected Successfully");

  return db;
};

module.exports = connectDB;
