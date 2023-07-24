const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb
const uri =
  "mongodb+srv://college-admission:NYMfxmu6CxkmuE3R@cluster0.mllrmzg.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // database collection
    const collegeCollection = client
      .db("collegeAdmissionDB")
      .collection("colleges");
    const userCollection = client.db("collegeAdmissionDB").collection("users");
    const myCollegeCollection = client
      .db("collegeAdmissionDB")
      .collection("myCollege");

    // to get all colleges
    app.get("/all-colleges", async (req, res) => {
      const result = await collegeCollection.find().toArray();
      res.send(result);
    });
    // to get featured colleges
    app.get("/featured-colleges", async (req, res) => {
      const result = await collegeCollection.find().limit(3).toArray();
      res.send(result);
    });

    // to get single college details
    app.get("/college/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collegeCollection.findOne(query);
      res.send(result);
    });

    // to get single college for search in navbar
    app.get("/single-college/:name", async (req, res) => {
      const name = req.params.name;
      const query = { name: { $regex: new RegExp(`^${name}`, "i") } };
      const college = await collegeCollection.findOne(query);

      if (!college) {
        return res.status(404).json({ error: "College not found" });
      }
      res.json(college);
    });

    // store user data on database
    app.post("/add-user", async (req, res) => {
      const userInfo = req.body;
      console.log(userInfo);
      const result = await userCollection.insertOne(userInfo);
      res.send(result);
    });

    // add application on my college
    app.post("/apply", async (req, res) => {
      const data = req.body;
      const result = await myCollegeCollection.insertOne(data);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("college-admission server is running");
});

app.listen(port, () => {
  console.log(`college-admission server is running port ${port}`);
});
