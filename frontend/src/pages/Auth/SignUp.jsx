import React, {useState} from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { Link, Navigate, useNavigate } from "react-router-dom";
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Handle Signup
  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validation
    if (!fullName) {
      setError("Please enter your name");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter a password");
      return;
    }

    setError("");

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("password", password);

      if (profilePic) {
        formData.append("image", profilePic);
      }

      const response = await fetch(
        // "http://localhost:8000/api/v1/auth/register" || process.env.FRONT_BASE_URL,
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/register`,
        {
          method: "POST",
          body: formData, 
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Save token for immediate login
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      navigate("/dashboard");

    } catch (error) {
      console.log("Signup Error:", error.message);
      setError(error.message);
    }
  };
  
  return (
    <AuthLayout>
      <div className="glass-panel p-8 sm:p-10 w-full animate-fade-in-up">
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">Create an Account</h3>
        <p className="text-sm font-medium text-slate-500 mt-2 mb-8">
          Join us today by entering your details below.
        </p>

          <form onSubmit={handleSignUp}>
          
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic}/>
    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={fullName}
                onChange={({ target }) => setFullName(target.value)}
                label="Full Name"
                placeholder="John"
                type="text"
              />
            
             <Input 
        value={email}
         onChange={({target}) => setEmail(target.value)}
        label="Email Address"
        placeholder='john@example.com'
        type="text" 
        />
           
         <div className="col-span-2">  
        <Input 
        value={password}
         onChange={({target}) => setPassword(target.value)}
        label="Password"
        placeholder="Min 8 characters"
        type="password" 
        />
        </div>
       
            </div>

           {error && <p className="text-red-500 text-xs pb-2.5"> {error}</p>}
           
                    <button type="submit" className="btn-primary mt-4 py-3.5 text-base">
                     SIGN UP
                    </button>
           
                     <p className="mt-6 text-center text-sm font-medium text-slate-500">
                       Already have an account?{" "}
                       <Link className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4 font-bold transition-colors" to="/login">
                         Sign In
                       </Link>
                     </p>

          </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp