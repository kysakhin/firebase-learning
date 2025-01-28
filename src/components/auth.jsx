import { auth, googleAuth } from "../config/firebase-config"
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth"
import { useState } from "react"

export const Auth = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async () => {
    await createUserWithEmailAndPassword(auth , email, password);
  };

  const signinWithGoogle = async () => {
    await signInWithPopup(auth, googleAuth);
  }

  const logout = async () => {
    try {
      await signOut(auth);
    } catch(err) {
      console.error(err);
    }
  }

  return (
  <div className="flex gap-5">
      <button onClick={signinWithGoogle}> Admin sign in </button>
      <button onClick={logout} > Logout </button>
  </div>
  )
}
