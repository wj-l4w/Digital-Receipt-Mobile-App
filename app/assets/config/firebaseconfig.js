// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDeZJVvroNzJMVzKQi5Q0vGfursi7L9ZpM",
	authDomain: "digital-receipt-app-jun.firebaseapp.com",
	projectId: "digital-receipt-app-jun",
	storageBucket: "digital-receipt-app-jun.appspot.com",
	messagingSenderId: "620075614471",
	appId: "1:620075614471:web:1ce8e1bf9ccc40c84405a2",
	measurementId: "G-H7DYLKMZ99",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
