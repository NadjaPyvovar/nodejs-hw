import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
     avatar: {
      type: String,
      default: "https://ac.goit.global/fullstack/react/default-avatar.jpg",
    },
  },
  {
    timestamps: true,
  },
);

// defaulting the username to the email when a new user is created
userSchema.pre("save", function () {
  if (this.isNew && !this.username) {
    this.username = this.email;
  }
});

// stripping the password prior to the document to be serialized to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = model("User", userSchema);

// notes: pre("save") = runs before each save; this.isNew = restricts the default to documents creation only, this will not reset username on later updates/refreshes; toJSON = overriding Mongoose way how the documents get converted to plain objects for res.json(...) (as res.json() calls JSON.stringify, which calls .toJSON() under the hood, guaranteeing the password never leaks in any response)
