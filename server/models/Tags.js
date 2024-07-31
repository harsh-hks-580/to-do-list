const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const TagSchema = new Schema(
  {
    name: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", require: true },
  },
  {
    timestamps: true,
  }
);

const TagModel = model("Tag", TagSchema);
module.exports = TagModel;
