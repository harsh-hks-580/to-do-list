const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const TagTaskJoinSchema = new Schema({
  tag_id: [{ type: Schema.Types.ObjectId, ref: "Tags" }],
  task_id: [{ type: Schema.Types.ObjectId, ref: "Task" }],
});

const TagTaskJoinModel = model("TagTaskJoin", TagTaskJoinSchema);
module.exports = TagTaskJoinModel;
