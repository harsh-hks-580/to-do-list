const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const TagSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const TagModel = model("Tag", TagSchema);
module.exports = TagModel;
