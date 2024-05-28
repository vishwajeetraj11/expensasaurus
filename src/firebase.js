import firebase from "firebase/app";
import "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCqanxCReBkUhpUkHMPQFdXS9EEt0vAxrU",
  authDomain: "push-notifica-50341.firebaseapp.com",
  projectId: "push-notifica-50341",
  storageBucket: "push-notifica-50341.appspot.com",
  messagingSenderId: "27594018291",
  appId: "1:27594018291:web:7a6b2ac91a3e1693121686",
};

firebase.initializeApp(firebaseConfig);

export const messaging = firebase.messaging();
