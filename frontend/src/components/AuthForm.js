import { useState, useEffect } from "react";
import { auth, googleProvider, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import "../styles/AuthForm.css";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState("");
  const [canRegister, setCanRegister] = useState(false);
  const [user, loading] = useAuthState(auth);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const saveUserToFirestore = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const role = user.email === "snapgotit2005@gmail.com" ? "admin" : "viewer";
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || "",
      uid: user.uid,
      role: role,
    });
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      let userCredential;
      if (!isLogin && !canRegister) {
        showAlert("Password is too weak. Please make it stronger.", "danger");
        return;
      }

      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        showAlert("Login Successful", "success");
        navigate("/dashboard");
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(userCredential.user);
        showAlert("Registration Successful", "success");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Firebase Auth Error:", error);
      switch (error.code) {
        case "auth/wrong-password":
          showAlert("Incorrect password. Please try again.", "danger");
          break;
        case "auth/user-not-found":
          showAlert("No user found with this email.", "danger");
          break;
        case "auth/invalid-email":
          showAlert("Invalid email format.", "danger");
          break;
        case "auth/too-many-requests":
          showAlert("Too many failed attempts. Try again later.", "danger");
          break;
        case "auth/email-already-in-use":
          showAlert("This email is already registered.", "danger");
          break;
        default:
          showAlert("Authentication failed: " + error.message, "danger");
          break;
      }
    }
  };

  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength < 2) {
      setPasswordStrength("Weak");
      setCanRegister(false);
    } else if (strength === 2 || strength === 3) {
      setPasswordStrength("Medium");
      setCanRegister(true);
    } else {
      setPasswordStrength("Strong");
      setCanRegister(true);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(result.user);
      showAlert("Login with Google Successful", "success");
      navigate("/dashboard");
    } catch (error) {
      showAlert(error.message, "danger");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="auth-container">
      <div className="bubble" />
      <div className="bubble" />
      <div className="bubble" />
      <div className="bubble" />
      <div className="bubble" />
      <div className="bubble" />
      <div className="auth-box">
        {alert.show && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
            {alert.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => setAlert({ show: false, message: "", type: "" })}
              aria-label="Close"
            ></button>
          </div>
        )}
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <div className="auth-form">
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => {
              const val = e.target.value;
              setPassword(val);
              if (!isLogin) checkPasswordStrength(val);
            }}
          />
          {!isLogin && (
            <div className={`strength ${passwordStrength.toLowerCase()}`}>
              Password Strength: {passwordStrength}
            </div>
          )}
          <button type="button" onClick={handleAuth}>
            {isLogin ? "Login" : "Register"}
          </button>
          <div className="divider">OR</div>
          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google icon"
              className="google-icon"
            />
            Continue with Google
          </button>
          <p onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;