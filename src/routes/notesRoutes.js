import { Router } from "express";
import { celebrate } from "celebrate";

import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from "../controllers/notesController.js";

import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from "../validations/notesValidation.js";

const router = Router();

// to each route, adding celebrate(schema) middleware to validate request data before reaching the controller
router.get("/notes", celebrate(getAllNotesSchema), getAllNotes);
router.get("/notes/:noteId", celebrate(noteIdSchema), getNoteById);
router.post("/notes", celebrate(createNoteSchema), createNote);
router.patch("/notes/:noteId", celebrate(updateNoteSchema), updateNote);
router.delete("/notes/:noteId", celebrate(noteIdSchema), deleteNote);

export default router;
