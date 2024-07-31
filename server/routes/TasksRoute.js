const router = require("express").Router();
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Tags = require("../models/Tags");
const TaskUserJoin = require("../models/TaskUserJoin");
const TagTaskJoin = require("../models/TagTaskJoin");

//Create a new task
router.post("/create", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const taskDoc = await Task.create({
      title: req.body.title,
      description: req.body.title,
    });
    TaskUserJoin.create({
      user_id: req.body.user_id,
      task_id: taskDoc._id,
    });

    const tags = req.body.tags;
    var tagTaskJoinEntries = [];
    if ((tags !== null) & (tags.length > 0)) {
      for (var tag of tags) {
        tagTaskJoinEntries.push({ task_id: taskDoc._id, tag_id: tag });
      }

      TagTaskJoin.insertMany(tagTaskJoinEntries);
    }

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

//Get a task by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const taskDoc = await Task.findById(id);
    res.json(taskDoc);
  } catch (err) {
    console.error(err);
    res.status(400).json("Error retrieving task with id: " + id);
  }
});

//Get tags for task
router.get("/:id/tags", async (req, res) => {
  const { id } = req.params;
  try {
    var tagId = [];
    for await (const tagTaskDoc of TagTaskJoin.find({ task_id: id })) {
      tagId.push(tagTaskDoc.tag_id);
    }

    const tagDocs = await Tags.find({ _id: { $in: tagId } });
    res.json(tagDocs);
  } catch (err) {
    console.error(err);
    res.status(400).json("Error fetching tags for task with id: " + id);
  }
});

//Delete task by id
router.delete("/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const taskDoc = await Task.findById(id);
    TagTaskJoin.deleteMany({ task_id: id }).then(
      await Task.findByIdAndDelete(id)
    );

    await session.commitTransaction();
    res.json("Delete Successful");
  } catch (err) {
    console.error("Abort Transation, ", err);
    await session.abortTransaction();
    res.status(400).json(err.message);
  } finally {
    await session.endSession();
  }
});

module.exports = router;
