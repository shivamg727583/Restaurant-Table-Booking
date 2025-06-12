const express = require("express")
const { auth } = require("../middleware/auth")
const Availability = require("../models/Availability")
const Booking = require("../models/Booking")
const Table = require("../models/Table")

const router = express.Router()

// View available slots
router.get("/view-availability", auth, async (req, res) => {
  try {
    const { date } = req.query

    const query = { isBooked: false }
    if (date) {
      const searchDate = new Date(date)
      query.date = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999)),
      }
    }

    const availability = await Availability.find(query)
      .populate("tableId", "tableNumber capacity")
      .sort({ date: 1, timeSlot: 1 })

    res.json(availability)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Book a table
router.post("/book-table", auth, async (req, res) => {
  try {
    const { availabilityId } = req.body

    if (!availabilityId) {
      return res.status(400).json({ message: "Availability ID is required" })
    }

    // Find the availability slot
    const availability = await Availability.findById(availabilityId).populate("tableId")

    if (!availability) {
      return res.status(404).json({ message: "Availability slot not found" })
    }

    if (availability.isBooked) {
      return res.status(400).json({ message: "This slot is already booked" })
    }

    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      tableId: availability.tableId._id,
      availabilityId: availability._id,
      date: availability.date,
      timeSlot: availability.timeSlot,
      status: "booked",
    })

    await booking.save()

    // Mark availability as booked
    availability.isBooked = true
    await availability.save()

    await booking.populate("tableId", "tableNumber capacity")

    res.json({
      message: "Table booked successfully!",
      booking,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// View user's bookings
router.get("/my-bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("tableId", "tableNumber capacity")
      .sort({ date: 1, timeSlot: 1 })

    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Cancel booking
router.put("/cancel-booking/:bookingId", auth, async (req, res) => {
  try {
    const { bookingId } = req.params

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id,
    })

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" })
    }

    // Update booking status
    booking.status = "cancelled"
    await booking.save()

    // Mark availability as available again
    await Availability.findByIdAndUpdate(booking.availabilityId, {
      isBooked: false,
    })

    res.json({ message: "Booking cancelled successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
