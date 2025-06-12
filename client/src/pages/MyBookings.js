"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/user/my-bookings")
      setBookings(response.data)
    } catch (error) {
      setMessage("Error fetching bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    try {
      setCancelling(bookingId)
      const response = await axios.put(`/api/user/cancel-booking/${bookingId}`)
      setMessage(response.data.message)

      // Refresh bookings
      fetchBookings()
    } catch (error) {
      setMessage(error.response?.data?.message || "Cancellation failed")
    } finally {
      setCancelling(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isUpcoming = (dateString, timeSlot) => {
    const bookingDate = new Date(dateString)
    const now = new Date()
    return bookingDate >= now
  }

  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "booked" && isUpcoming(booking.date, booking.timeSlot),
  )

  const pastBookings = bookings.filter(
    (booking) => booking.status === "cancelled" || !isUpcoming(booking.date, booking.timeSlot),
  )

  return (
    <div className="container">
      <h1>My Bookings</h1>

      {message && <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>{message}</div>}

      {loading ? (
        <div className="loading">Loading your bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You don't have any bookings yet.</p>
          <a href="/book" className="book-button">
            Book Your First Table
          </a>
        </div>
      ) : (
        <div className="bookings-sections">
          {/* Upcoming Bookings */}
          <div className="bookings-section">
            <h2>Upcoming Bookings</h2>
            {upcomingBookings.length === 0 ? (
              <p>No upcoming bookings.</p>
            ) : (
              <div className="bookings-grid">
                {upcomingBookings.map((booking) => (
                  <div key={booking._id} className="booking-card upcoming">
                    <div className="booking-info">
                      <h3>{formatDate(booking.date)}</h3>
                      <p>
                        <strong>Time:</strong> {booking.timeSlot}
                      </p>
                      <p>
                        <strong>Table:</strong> {booking.tableId.tableNumber}
                      </p>
                      <p>
                        <strong>Capacity:</strong> {booking.tableId.capacity} people
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span className={`status ${booking.status}`}>{booking.status}</span>
                      </p>
                    </div>
                    <div className="booking-actions">
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancelling === booking._id}
                        className="cancel-btn"
                      >
                        {cancelling === booking._id ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past/Cancelled Bookings */}
          <div className="bookings-section">
            <h2>Past & Cancelled Bookings</h2>
            {pastBookings.length === 0 ? (
              <p>No past bookings.</p>
            ) : (
              <div className="bookings-grid">
                {pastBookings.map((booking) => (
                  <div key={booking._id} className="booking-card past">
                    <div className="booking-info">
                      <h3>{formatDate(booking.date)}</h3>
                      <p>
                        <strong>Time:</strong> {booking.timeSlot}
                      </p>
                      <p>
                        <strong>Table:</strong> {booking.tableId.tableNumber}
                      </p>
                      <p>
                        <strong>Capacity:</strong> {booking.tableId.capacity} people
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span className={`status ${booking.status}`}>{booking.status}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookings
