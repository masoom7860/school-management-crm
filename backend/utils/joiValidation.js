import Joi from 'joi';

export const subjectSchema = Joi.object({
  name: Joi.string().required(),
  maxMarks: Joi.number().min(1).required(),
  minMarks: Joi.number().min(0).required(),
  obtainedMarks: Joi.number().min(0).required()
});

export const marksheetSchema = Joi.object({
  studentId: Joi.string().required(),
  examName: Joi.string().required(),
  subjects: Joi.array().items(subjectSchema).min(1).required(),
  remarks: Joi.string().allow('')
});
