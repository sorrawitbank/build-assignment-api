import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  try {
    const newAssignment = {
      ...req.body,
    };

    if (
      !newAssignment.title ||
      !newAssignment.content ||
      !newAssignment.category
    ) {
      return res.status(400).json({
        message:
          "Server could not create assignment because there are missing data from client",
      });
    }

    await connectionPool.query(
      "insert into assignments (title, content, category, length, user_id, status, created_at, updated_at, published_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        1,
        newAssignment.status,
        new Date(),
        new Date(),
        new Date(),
      ]
    );
  } catch (error) {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }

  return res.status(201).json({ message: "Movie has been created." });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
