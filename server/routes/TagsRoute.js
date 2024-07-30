const router = require("express").Router();
const mongoose = require("mongoose");
const Tag = require("../models/Tags");

router.post("/tags", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tagDoc = await Tag.create({
      name: req.body.name,
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

module.exports = router;
