import React, {useState} from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { Link, useNavigate } from "react-router-dom";
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';

const Login = () => {
  const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const navigate = useNavigate()

     const handleLogin = async (e) => {
     e.preventDefault();

    if (!validateEmail(email)) {
    setError("Please enter a valid email address");
    return;
     }

    if (!password) {
    setError("Please Enter the Password");
    return;
    }
 
    setError("");

  try {
    const response = await fetch(
      // "http://localhost:8000/api/v1/auth/login", 
       `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/login`,
      {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();
 
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }
    // Save token to localStorage for frontend guards
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    
    // Redirect to dashboard
    navigate("/dashboard");

  } catch (err) {
    setError(err.message);
  }
};




  return (
    <AuthLayout>
      <div className="glass-panel p-8 sm:p-10 w-full animate-fade-in-up">
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">Welcome Back</h3>
        <p className="text-sm font-medium text-slate-500 mt-2 mb-8">
          Please enter your details to sign in.
        </p>

       <form onSubmit={handleLogin}>
        <Input 
        value={email}
         onChange={({target}) => setEmail(target.value)}
        label="Email Address"
        placeholder='john@example.com'
        type="text" 
        />

        <Input 
        value={password}
         onChange={({target}) => setPassword(target.value)}
        label="Password"
        placeholder="Min 8 characters"
        type="password" 
        />

        <div className="text-right -mt-4 mb-4">
            <Link to="/forgot-password" size="sm" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                Forgot Password?
            </Link>
        </div>
         
         {error && <p className="text-red-500 text-xs pb-2.5"> {error}</p>}

         <button type="submit" className="btn-primary mt-4 py-3.5 text-base">
          SIGN IN
         </button>

          <p className="mt-6 text-center text-sm font-medium text-slate-500">
            Don't have an account?{" "}
            <Link className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4 font-bold transition-colors" to="/signup">
              Sign Up
            </Link>
          </p>

       </form>

      </div>
    </AuthLayout>
  )
}

export default Login