import { useEffect, useState } from 'react';
import './App.css';
import { Auth } from './components/auth';
import { db, auth } from './config/firebase-config';
import { getDocs, collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { franc } from 'franc';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [language, setLanguage] = useState('');
  const [description, setDescription] = useState('');
  const [user, setUser] = useState(null);  // Store user information

  // Detecting language
  const detectlang = async (text) => {
    const langCode = franc(text);
    if (langCode === "und") return "-";
    if (langCode === "eng") return "English";
    if (langCode === "deu") return "Deutsch";
    return "-";
  };

  const reviewsRef = collection(db, "firebase-test");

  // Fetch reviews from Firestore
  const getReviews = async () => {
    try {
      const data = await getDocs(reviewsRef);
      const filtered = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setReviews(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete review only if user is logged in
  const deleteReview = async (id) => {
    if (!user) {
      console.log("You need to be logged in to delete a review.");
      return;
    }
    const toDelete = doc(db, "firebase-test", id);
    await deleteDoc(toDelete);
    getReviews();
  };

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    getReviews(); // Fetch reviews when the component mounts
    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  // Submit review to Firestore
  const onSubmitReview = async () => {
    const lang = await detectlang(description);
    setLanguage(lang);
    await addDoc(reviewsRef, { name: name, rating: rating, language: lang, description: description });
    getReviews();  // Refresh the list of reviews
  };

  return (
    <>
      <Auth />
      {/* Create review section */}
      <div>
        <input placeholder="Your name" onChange={(e) => setName(e.target.value)} /> <br />
        <input placeholder="Rating out of 5" type="number" onChange={(e) => setRating(Number(e.target.value))} /> <br />
        <textarea placeholder="Description" onChange={(e) => setDescription(e.target.value)} /> <br />
        <button onClick={onSubmitReview}>Submit</button>
      </div>

      {/* Display reviews */}
      <div>
        {reviews.map((review) => (
          <div className="review" key={review.id}>
            <h1>{review.name}</h1>
            <h2>{review.rating}</h2>
            <h3>{review.language}</h3>
            <p>{review.description}</p>
            {/* Allow delete only if user is logged in */}
            {user && (
              <button onClick={() => deleteReview(review.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
