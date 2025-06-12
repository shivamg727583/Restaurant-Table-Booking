const express = require("express")
const { adminAuth } = require("../middleware/auth")
const Table = require("../models/Table")
const Availability = require("../models/Availability")
const Booking = require("../models/Booking")

const router = express.Router()

// Create tables (one-time setup)
router.post("/create-tables", adminAuth, async (req, res) => {
  try {
    const tables = [
      { tableNumber: 1, capacity: 2 },
      { tableNumber: 2, capacity: 4 },
      { tableNumber: 3, capacity: 6 },
      { tableNumber: 4, capacity: 2 },
      { tableNumber: 5, capacity: 4 },
      { tableNumber: 6, capacity: 8 },
    ]

    await Table.insertMany(tables)
    res.json({ message: "Tables created successfully" })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Tables already exist" })
    }
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Set availability
router.post("/set-availability", adminAuth, async (req, res) => {
  try {
    const { date, timeSlots } = req.body

    if (!date || !timeSlots || !Array.isArray(timeSlots)) {
      return res.status(400).json({ message: "Date and time slots are required" })
    }

    const tables = await Table.find()
    const availabilityData = []

    for (const table of tables) {
      for (const timeSlot of timeSlots) {
        availabilityData.push({
          date: new Date(date),
          timeSlot,
          tableId: table._id,
          isBooked: false,
        })
      }
    }

    await Availability.insertMany(availabilityData)
    res.json({ message: "Availability set successfully" })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Availability already exists for this date and time" })
    }
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// View all bookings
router.get("/view-bookings", adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("tableId", "tableNumber capacity")
      .sort({ date: 1, timeSlot: 1 })

    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all tables
router.get("/tables", adminAuth, async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 })
    res.json(tables)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
