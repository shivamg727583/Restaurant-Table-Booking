"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const Home = () => {
  const { user } = useAuth()
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")

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
      console.error("Error fetching availability:", error)
    } finally {
      setLoading(false)
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

  if (user?.role === "admin") {
    return (
      <div className="container">
        <div className="welcome-section">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user.name}! Manage your restaurant bookings.</p>
          <Link to="/admin" className="cta-button">
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="welcome-section">
        <h1>Welcome to Restaurant Booking</h1>
        <p>Book your perfect dining experience with us!</p>
      </div>

      <div className="availability-section">
        <div className="section-header">
          <h2>Available Tables</h2>
          <div className="date-filter">
            <label>Filter by date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate("")} className="clear-filter">
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading available tables...</div>
        ) : Object.keys(groupedAvailability).length === 0 ? (
          <div className="no-availability">
            <p>No tables available for the selected date.</p>
            <Link to="/book" className="book-button">
              View All Available Slots
            </Link>
          </div>
        ) : (
          <div className="availability-grid">
            {Object.entries(groupedAvailability).map(([date, slots]) => (
              <div key={date} className="date-group">
                <h3>{date}</h3>
                <div className="time-slots">
                  {slots.map((slot) => (
                    <div key={slot._id} className="time-slot">
                      <div className="slot-info">
                        <span className="time">{slot.timeSlot}</span>
                        <span className="table">
                          Table {slot.tableId.tableNumber} (Seats {slot.tableId.capacity})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cta-section">
          <Link to="/book" className="cta-button">
            Book a Table Now
          </Link>
          <Link to="/my-bookings" className="secondary-button">
            View My Bookings
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
