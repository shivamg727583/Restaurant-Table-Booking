"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const result = await login(formData.email, formData.password)

    if (result.success) {
      setMessage(result.message)
      navigate("/")
    } else {
      setMessage(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <div className={`message ${message.includes("successful") ? "success" : "error"}`}>{message}</div>}

        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>

        <div className="demo-accounts">
          <h4>Demo Accounts:</h4>
          <p>
            <strong>Admin:</strong> admin@restaurant.com / password123
          </p>
          <p>
            <strong>Customer:</strong> customer@test.com / password123
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
