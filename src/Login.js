// src/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-config';
import { getErrorMessage } from './errorMessages'; // Import error mapping function
import './Form.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailPattern.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    if (validateForm()) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage('Login successful!');
        console.log('User logged in:', userCredential.user);
        // Clear the form fields
        setEmail('');
        setPassword('');
        setErrors({});
        navigate('/'); // Redirect to home page after login
      } catch (error) {
        setErrors({ form: getErrorMessage(error.code) }); // Display custom error message
        console.error('Error logging in user:', error);
      }
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {errors.email && <p className="error" role="alert">{errors.email}</p>}

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errors.password && <p className="error" role="alert">{errors.password}</p>}

        <button type="submit">Login</button>
        {errors.form && <p className="error" role="alert">{errors.form}</p>}
        {successMessage && <p className="success" role="status">{successMessage}</p>}
      </form>
      <p>
        Don't have an account? <Link to="/register">Sign up here</Link>
      </p>
    </div>
  );
}

export default Login;
