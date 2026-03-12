// Chaves Reais de Produção (Tom Barbearia)
const firebaseConfig = {
  apiKey: "AIzaSyCE2QXgTvBn_GJ9VfkehTiEUyQIBSPbYWk",
  authDomain: "tom-barbearia.firebaseapp.com",
  projectId: "tom-barbearia",
  storageBucket: "tom-barbearia.firebasestorage.app",
  messagingSenderId: "477884690960",
  appId: "1:477884690960:web:ec68ba64c4b0de00859095",
  measurementId: "G-3CLJEY197B"
};

// Initialize Firebase using global compat
firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
