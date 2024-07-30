const router = require("express").Router();
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Tags = require("../models/Tags");

router.post("/tasks", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tags = req.body.tags;
    let tagDocs = [];
    if ((tags !== null) & (tags.length > 0)) {
      for (var tag of tags) {
        let tagDoc = await Tags.findOne({ name: tag });
        if (tagDoc === null) {
          throw new Error("Specified tags do not exist");
        }
        tagDocs.push(tagDoc._id);
      }
    }

    const taskDoc = await Task.create({
      title: req.body.title,
      status: "PENDING",
      user: req.body.userId,
      tags: tagDocs,
    });

    await session.commitTransaction();
    res.json(taskDoc);
  } catch (err) {
    console.error("Abort Transation, ", err);
    await session.abortTransaction();
    res.status(400).json(err.message);
  } finally {
    await session.endSession();
  }
});

module.exports = router;
