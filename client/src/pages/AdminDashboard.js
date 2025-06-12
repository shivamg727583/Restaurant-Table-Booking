"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("availability")
  const [bookings, setBookings] = useState([])
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const [availabilityForm, setAvailabilityForm] = useState({
    date: "",
    timeSlots: [],
  })

  const timeSlotOptions = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
    "09:00 PM",
    "10:00 PM",
  ]

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookings()
    } else if (activeTab === "availability") {
      fetchTables()
    }
  }, [activeTab])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/admin/view-bookings")
      setBookings(response.data)
    } catch (error) {
      setMessage("Error fetching bookings")
    } finally {
      setLoading(false)
    }
  }

  const fetchTables = async () => {
    try {
      const response = await axios.get("/api/admin/tables")
      setTables(response.data)
    } catch (error) {
      console.error("Error fetching tables:", error)
    }
  }

  const createTables = async () => {
    try {
      setLoading(true)
      const response = await axios.post("/api/admin/create-tables")
      setMessage(response.data.message)
      fetchTables()
    } catch (error) {
      setMessage(error.response?.data?.message || "Error creating tables")
    } finally {
      setLoading(false)
    }
  }

  const handleTimeSlotChange = (timeSlot) => {
    setAvailabilityForm((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(timeSlot)
        ? prev.timeSlots.filter((slot) => slot !== timeSlot)
        : [...prev.timeSlots, timeSlot],
    }))
  }

  const handleSetAvailability = async (e) => {
    e.preventDefault()

    if (!availabilityForm.date || availabilityForm.timeSlots.length === 0) {
      setMessage("Please select date and at least one time slot")
      return
    }

    try {
      setLoading(true)
      const response = await axios.post("/api/admin/set-availability", availabilityForm)
      setMessage(response.data.message)
      setAvailabilityForm({ date: "", timeSlots: [] })
    } catch (error) {
      setMessage(error.response?.data?.message || "Error setting availability")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === "availability" ? "active" : ""}`}
          onClick={() => setActiveTab("availability")}
        >
          Set Availability
        </button>
        <button className={`tab ${activeTab === "bookings" ? "active" : ""}`} onClick={() => setActiveTab("bookings")}>
          View Bookings
        </button>
      </div>

      {message && <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>{message}</div>}

      {activeTab === "availability" && (
        <div className="tab-content">
          <div className="admin-section">
            <h2>Manage Tables</h2>
            {tables.length === 0 ? (
              <div>
                <p>No tables found. Create tables first.</p>
                <button onClick={createTables} disabled={loading} className="admin-btn">
                  {loading ? "Creating..." : "Create Default Tables"}
                </button>
              </div>
            ) : (
              <div className="tables-grid">
                {tables.map((table) => (
                  <div key={table._id} className="table-card">
                    <h4>Table {table.tableNumber}</h4>
                    <p>Capacity: {table.capacity} people</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-section">
            <h2>Set Availability</h2>
            <form onSubmit={handleSetAvailability} className="availability-form">
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={availabilityForm.date}
                  onChange={(e) =>
                    setAvailabilityForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time Slots:</label>
                <div className="time-slots-grid">
                  {timeSlotOptions.map((timeSlot) => (
                    <label key={timeSlot} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={availabilityForm.timeSlots.includes(timeSlot)}
                        onChange={() => handleTimeSlotChange(timeSlot)}
                      />
                      {timeSlot}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="admin-btn">
                {loading ? "Setting..." : "Set Availability"}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="tab-content">
          <h2>All Bookings</h2>
          {loading ? (
            <div className="loading">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <div className="bookings-table">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Table</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.userId.name}</td>
                      <td>{booking.userId.email}</td>
                      <td>
                        Table {booking.tableId.tableNumber} ({booking.tableId.capacity} seats)
                      </td>
                      <td>{formatDate(booking.date)}</td>
                      <td>{booking.timeSlot}</td>
                      <td>
                        <span className={`status ${booking.status}`}>{booking.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
