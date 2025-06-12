"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const BookingPage = () => {
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [message, setMessage] = useState("")
  const [selectedDate, setSelectedDate] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    fetchAvailability()
  }, [selectedDate])

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const params = selectedDate ? { date: selectedDate } : {}
      const response = await axios.get("/api/user/view-availability", { params })
      setAvailability(response.data)
    } catch (error) {
      setMessage("Error fetching availability")
    } finally {
      setLoading(false)
    }
  }

  const handleBookTable = async (availabilityId) => {
    try {
      setBooking(true)
      const response = await axios.post("/api/user/book-table", {
        availabilityId,
      })

      setMessage(response.data.message)

      // Refresh availability after booking
      setTimeout(() => {
        fetchAvailability()
        navigate("/my-bookings")
      }, 2000)
    } catch (error) {
      setMessage(error.response?.data?.message || "Booking failed")
    } finally {
      setBooking(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const groupByDate = (availability) => {
    return availability.reduce((groups, item) => {
      const date = formatDate(item.date)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(item)
      return groups
    }, {})
  }

  const groupedAvailability = groupByDate(availability)

  return (
    <div className="container">
      <h1>Book a Table</h1>

      <div className="booking-filters">
        <div className="filter-group">
          <label>Filter by date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
          {selectedDate && (
            <button onClick={() => setSelectedDate("")} className="clear-filter">
              Show All
            </button>
          )}
        </div>
      </div>

      {message && <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>{message}</div>}

      {loading ? (
        <div className="loading">Loading available tables...</div>
      ) : Object.keys(groupedAvailability).length === 0 ? (
        <div className="no-availability">
          <p>No tables available for the selected criteria.</p>
          <p>Please try a different date or check back later.</p>
        </div>
      ) : (
        <div className="booking-grid">
          {Object.entries(groupedAvailability).map(([date, slots]) => (
            <div key={date} className="date-section">
              <h2>{date}</h2>
              <div className="slots-grid">
                {slots.map((slot) => (
                  <div key={slot._id} className="slot-card">
                    <div className="slot-info">
                      <h3>{slot.timeSlot}</h3>
                      <p>Table {slot.tableId.tableNumber}</p>
                      <p>Capacity: {slot.tableId.capacity} people</p>
                    </div>
                    <button onClick={() => handleBookTable(slot._id)} disabled={booking} className="book-btn">
                      {booking ? "Booking..." : "Book Now"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookingPage
