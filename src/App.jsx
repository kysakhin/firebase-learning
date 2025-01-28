import { useEffect, useState } from "react";
import "./App.css"
import { Auth } from "./components/auth";
import { db, auth } from "./config/firebase-config";
import { getDocs, collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { franc } from "franc";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [reviews, setReviews] = useState([]);

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState({});
  const MAX_CHARS = 200;

  const reviewsRef = collection(db, "firebase-test");

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!rating || rating < 1 || rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5";
    }
    
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length > MAX_CHARS) {
      newErrors.description = `Description cannot exceed ${MAX_CHARS} characters`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getReviews = async () => {
    try {
      const data = await getDocs(reviewsRef);
      const filtered = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setReviews(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReview = async (id) => {
    const toDelete = doc(db, "firebase-test", id);
    await deleteDoc(toDelete);
    getReviews();
  };

  const detectLang = async (text) => {
    const langCode = franc(text);
    if (langCode === "und") {
      return "-";
    } else if (langCode === "eng") {
      return "English";
    } else if (langCode === "deu") {
      return "Deutsch";
    }
  };

  const onSubmitReview = async () => {
    if (validateForm()) {
      const lang = await detectLang(description);
      await addDoc(reviewsRef, {
        name,
        rating,
        language: lang,
        description,
      });
      // Reset form
      setName("");
      setRating(0);
      setDescription("");
      setErrors({});
      getReviews();
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    getReviews();
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 ">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Review App</h1>
        <Auth />
      </header>

      {/* Add Review Form */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8 max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-4">Add a Review</h2>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : ''
            }`}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <div className="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded">
              {errors.name}
            </div>
          )}
        </div>

        <div className="mb-4">
          <input
            type="number"
            placeholder="Rating out of 5"
            value={rating || ''}
            min="1"
            max="5"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.rating ? 'border-red-500' : ''
            }`}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          {errors.rating && (
            <div className="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded">
              {errors.rating}
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="relative">
            <textarea
              placeholder="Description"
              value={description}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : ''
              } ${description.length > MAX_CHARS ? 'border-red-500' : ''}`}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              maxLength={MAX_CHARS}
            />
            <div className={`text-sm mt-1 text-right ${
              description.length > MAX_CHARS ? 'text-red-500' : 'text-gray-500'
            }`}>
              {description.length}/{MAX_CHARS} characters
            </div>
          </div>
          {errors.description && (
            <div className="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded">
              {errors.description}
            </div>
          )}
        </div>

        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={onSubmitReview}
          disabled={description.length > MAX_CHARS}
        >
          Submit
        </button>
      </div>

      {/* Reviews Section */}
      <div className="space-y-4 max-w-lg mx-auto">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white shadow-lg rounded-lg p-4 flex justify-between items-start"
          >
            <div>
              <h3 className="text-lg font-semibold">{review.name}</h3>
              <p className="text-sm text-gray-600">{review.rating} / 5</p>
              <p className="text-sm text-gray-500">{review.language}</p>
              <p>{review.description}</p>
            </div>
            {user && (
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                onClick={() => deleteReview(review.id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
