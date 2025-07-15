import React, { useState } from "react";
import { auth, googleProvider, db } from "../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

const AuthForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const [passwordStrength, setPasswordStrength] = useState("");
    const [canRegister, setCanRegister] = useState(false);


    const saveUserToFirestore = async (user) => {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            email: user.email,
            name: user.displayName || "",
            uid: user.uid,
        });
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            let userCredential;
            if (!isLogin && !canRegister) {
  alert("Password is too weak. Please make it stronger.");
  return;
}

            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                alert("Login Successful");
                navigate("/dashboard");
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await saveUserToFirestore(userCredential.user);
                alert("Registration Successful");
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Firebase Auth Error:", error);

            switch (error.code) {
                case "auth/wrong-password":
                    alert("Incorrect password. Please try again.");
                    break;
                case "auth/user-not-found":
                    alert("No user found with this email.");
                    break;
                case "auth/invalid-email":
                    alert("Invalid email format.");
                    break;
                case "auth/too-many-requests":
                    alert("Too many failed attempts. Try again later.");
                    break;
                case "auth/email-already-in-use":
                    alert("This email is already registered.");
                    break;
                default:
                    alert("Authentication failed: " + error.message);
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
            navigate("/dashboard");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="bubble" />
            <div className="bubble" />
            <div className="bubble" />
            <div className="bubble" />
            <div className="bubble" />
            <div className="bubble" />
            <form className="auth-box" onSubmit={handleAuth}>
                <h2>{isLogin ? "Login" : "Register"}</h2>
                <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
  type="password"
  placeholder="Enter your password"
  required
  onChange={(e) => {
    const val = e.target.value;
    setPassword(val);
    if (!isLogin) checkPasswordStrength(val);
  }}
/>
{!isLogin && (
  <div className={`strength ${passwordStrength.toLowerCase()}`}>
    Strength: {passwordStrength}
  </div>
)}


                <button type="submit">{isLogin ? "Login" : "Register"}</button>

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
            </form>
        </div>
    );
};

export default AuthForm;
