const mongoose = require('mongoose');

const { Schema } = mongoose;

const idCardTemplateSchema = new Schema(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'registerschools',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    templateJson: {
      type: Schema.Types.Mixed,
      default: {},
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'staffs',
    },
  },
  {
    timestamps: true,
  }
);

idCardTemplateSchema.index({ schoolId: 1, type: 1 }, { unique: true });

module.exports = mongoose.models.IDCardTemplate || mongoose.model('IDCardTemplate', idCardTemplateSchema);
