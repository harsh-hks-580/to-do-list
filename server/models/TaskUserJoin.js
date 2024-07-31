const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const TaskUserJoinSchema = new Schema({
  user_id: [{ type: Schema.Types.ObjectId, ref: "User" }],
  task_id: [{ type: Schema.Types.ObjectId, ref: "Task" }],
});

const TaskUserJoinModel = model("TaskUserJoin", TaskUserJoinSchema);
module.exports = TaskUserJoinModel;
