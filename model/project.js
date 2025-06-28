const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");


const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    uuid: {
  type: String,
  required: true,
  unique: true,
  default: uuidv4,
},
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

projectSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("createdBy")) {
    this.members = Array.from(new Set([...(this.members || []), this.createdBy]));
  }
  next();
});

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
