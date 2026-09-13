import { Note } from "../models/note.js";
import createHttpError from "http-errors";

// updated controller functions to handle pagination, filtering, and searching
export const getAllNotes = async (req, res) => {
  const { page, perPage, tag, search } = req.query;

  const skip = (page - 1) * perPage;

  let notesQuery = Note.find().where("userId").equals(req.user._id);

  if (tag) {
    notesQuery = notesQuery.where("tag").equals(tag);
  }

  if (search) {
    notesQuery = notesQuery.where({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ],
    });
  }

  const [notes, totalNotes] = await Promise.all([
    notesQuery.clone().skip(skip).limit(perPage),
    Note.countDocuments(notesQuery.getFilter()),
  ]);

  const totalPages = Math.ceil(totalNotes / perPage);

  res.status(200).json({
    page,
    perPage,
    totalNotes,
    totalPages,
    notes,
  });
};

export const getNoteById = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOne({ _id: noteId, userId: req.user._id });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const note = await Note.create({
    ...req.body,
    userId: req.user._id,
  });

  res.status(201).json(note);
};

export const deleteNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};

export const updateNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate(
    {
      _id: noteId,
      userId: req.user._id
    },
    req.body,
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};

// notes: every query filters now by userId: req.user._id (set by authenticate) in addition to the note's own _id; as findById can't filter also by owner (only by id), so findOne, findOneAdnUpdate, findOneAndDelete with a combined filter to tbe used; if the note exists but belongs to another user, the filter will not match, leading to 404 Note not found (not 403) (i.e. the fact that the note exists will not be leaked at all)
