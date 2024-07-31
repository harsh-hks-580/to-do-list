const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const TaskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ title: "text", description: "text" });

const TaskModel = model("Task", TaskSchema);
module.exports = TaskModel;
