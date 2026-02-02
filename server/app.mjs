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
      "INSERT INTO assignments (title, content, category, length, user_id, status, created_at, updated_at, published_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
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

app.get("/assignments", async (req, res) => {
  let result;

  try {
    result = await connectionPool.query("SELECT * FROM assignments");
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }

  return res.status(200).json(result.rows);
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;
  let result;

  try {
    result = await connectionPool.query(
      "SELECT * FROM assignments WHERE assignment_id = $1",
      [assignmentId]
    );

    if (!result.rowCount) {
      return res
        .status(404)
        .json({ message: "Server could not find a requested assignment" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }

  return res.status(200).json(result.rows[0]);
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;
  const updatedAssignment = { ...req.body, updated_at: new Date() };

  if (
    !updatedAssignment.title ||
    !updatedAssignment.content ||
    !updatedAssignment.category
  ) {
    return res.status(400).json({
      message:
        "Server could not update assignment because there are missing data from client",
    });
  }

  try {
    const result = await connectionPool.query(
      "UPDATE assignments SET title = $2, content = $3, category = $4, updated_at = $5 WHERE assignment_id = $1",
      [
        assignmentId,
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
        updatedAssignment.updated_at,
      ]
    );
    if (!result.rowCount) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }

  return res.status(200).json({ message: "Updated assignment successfully" });
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;

  try {
    const result = await connectionPool.query(
      "DELETE FROM assignments WHERE assignment_id = $1",
      [assignmentId]
    );
    if (!result.rowCount) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }

  return res.status(200).json({ message: "Deleted assignment successfully" });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
