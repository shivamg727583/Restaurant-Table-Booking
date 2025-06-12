const mongoose = require("mongoose")

const availabilitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate availability slots
availabilitySchema.index({ date: 1, timeSlot: 1, tableId: 1 }, { unique: true })

module.exports = mongoose.model("Availability", availabilitySchema)
