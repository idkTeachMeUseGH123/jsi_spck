// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwVTCZFy-QXjQvyqhJAmZPF9ij_fIHAT4",
  authDomain: "jsi-spck-b4f75.firebaseapp.com",
  projectId: "jsi-spck-b4f75",
  storageBucket: "jsi-spck-b4f75.firebasestorage.app",
  messagingSenderId: "30139068626",
  appId: "1:30139068626:web:089cc7be62c7a06005fd0b",
  measurementId: "G-2P7DK4LL9S"
};
// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Khởi tạo Firestore
const db = firebase.firestore();

const auth = firebase.auth();

const storage = firebase.storage();
 