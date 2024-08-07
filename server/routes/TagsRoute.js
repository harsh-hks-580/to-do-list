const router = require("express").Router();
const mongoose = require("mongoose");
const Tag = require("../models/Tags");
const Task = require("../models/Task");
const TagTaskJoin = require("../models/TagTaskJoin");

router.post("/create", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tagDoc = await Tag.create({
      name: req.body.name,
      user_id: req.userInfo.id,
    });

    await session.commitTransaction();
    res.json(tagDoc);
  } catch (err) {
    console.error("Abort Transation, ", err);
    await session.abortTransaction();
    res.json(err);
  } finally {
    await session.endSession();
  }
});

router.get("/", async (req, res) => {
  try {
    const tagDocs = await Tag.find({ user_id: req.userInfo.id });
    res.json(tagDocs);
  } catch (err) {
    console.error(err);
    res.status(400).json({ Error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tagDoc = await Tag.findById(id);
    res.json(tagDoc);
  } catch (err) {
    console.error(err);
    res.status(400).json({ Error: err.message });
  }
});

//Get tasks for tag
router.get("/:id/tasks", async (req, res) => {
  const { id } = req.params;
  try {
    var taskId = [];
    for await (const tagTaskDoc of TagTaskJoin.find({ tag_id: id })) {
      taskId.push(tagTaskDoc.task_id);
    }

    const taskDocs = await Task.find({ _id: { $in: taskId } });
    res.json(taskDocs);
  } catch (err) {
    console.error(err);
    res.status(400).json({ Error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const tagDoc = await Tag.findById(id);
    TagTaskJoin.deleteMany({ tag_id: id }).then(
      await Tag.findByIdAndDelete(id)
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
