const router = require("express").Router();
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
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
      description: req.body.description,
    });
    TaskUserJoin.create({
      user_id: req.body.user_id,
      task_id: taskDoc._id,
    });

    const tags = req.body.tags;
    var tagTaskJoinEntries = [];
    if (tags && Array.isArray(tags) && tags.length > 0) {
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
    res.status(400).json({ Error: err.message });
  } finally {
    await session.endSession();
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
    res.status(400).json({ Error: err.message });
  }
});

//Search for a task
router.post("/search", async (req, res) => {
  try {
    var query = Task.find();

    if (req.body.id) {
      if (!ObjectId.isValid(req.body.id)) throw new Error("Invalid id");
      query.findOne({ _id: req.body.id });
    } else {
      if (req.body.text) {
        query.find({ $text: { $search: req.body.text } }).sort({
          score: { $meta: "textScore" },
        });
      }
      if (req.body.status) {
        query.find({ status: req.body.status.toUpperCase() });
      }
    }
    query.exec().then((taskDocs) => {
      res.json(taskDocs);
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ Error: err.message });
  }
});

//Patch a task by id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedTaskDoc = await Task.findByIdAndUpdate(
      id,
      { $set: req.body },
      { returnOriginal: false }
    );
    res.json(updatedTaskDoc);
  } catch (err) {
    console.error(err);
    res.status(400).json({ Error: err.message });
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
    res.status(400).json({ Error: err.message });
  } finally {
    await session.endSession();
  }
});

module.exports = router;
