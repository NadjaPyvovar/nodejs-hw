import { Joi, Segments } from "celebrate";
import { isValidObjectId } from "mongoose";
import { TAGS } from "../constants/tags.js";

// Setting reusable custom Joi rule for string to be a valid Mongo ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!isValidObjectId(value)) {
    return helpers.message("{{#label}} must be a valid Mongo ObjectId");
  }
  return value;
}, "Mongo ObjectId validation");

// setting pagination, search, etc: GET /notes?page=&perPage=&tag=&search=
export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string().valid(...TAGS),
    search: Joi.string().allow(""),
  }),
};

// setting validation schema for GET /notes/:noteId & DELETE /notes/:noteId
export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object().keys({
    noteId: objectId.required(),
  }),
};

// ...for POST /notes
export const createNoteSchema = {
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(1).required(),
    content: Joi.string().allow(""),
    tag: Joi.string().valid(...TAGS),
  }),
};

// ...for PATCH /notes/:noteId (i.e. reusing noteIdSchema params plus body schema)
export const updateNoteSchema = {
  ...noteIdSchema,
  [Segments.BODY]: Joi.object()
    .keys({
      title: Joi.string().min(1),
      content: Joi.string().allow(""),
      tag: Joi.string().valid(...TAGS),
    })
    .min(1), 
};
