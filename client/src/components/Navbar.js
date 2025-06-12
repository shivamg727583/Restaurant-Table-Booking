"use client"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🍽️ Restaurant Booking
        </Link>

        {user && (
          <div className="nav-menu">
            <Link to="/" className="nav-link">
              Home
            </Link>
            {user.role === "admin" ? (
              <Link to="/admin" className="nav-link">
                Admin Dashboard
              </Link>
            ) : (
              <>
                <Link to="/book" className="nav-link">
                  Book Table
                </Link>
                <Link to="/my-bookings" className="nav-link">
                  My Bookings
                </Link>
              </>
            )}
            <div className="nav-user">
              <span>Welcome, {user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
