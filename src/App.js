import React, { useRef, useState } from "react";
import "./App.css";
import logo from "./assets/logo.png";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyCk0GW44Loy2uj5iECM-i_q-8GBujDTSmE", // Change this
  authDomain: "reachout-e404b.firebaseapp.com", // Change this
  databaseURL: "https://reachout-e404b.firebaseio.com", // Change this
  projectId: "reachout-e404b", // Change this
  storageBucket: "reachout-e404b.appspot.com", // Change this
  messagingSenderId: "469379204606", // Change this
  appId: "1:469379204606:web:b741893272115047756caf", // Change this
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <img src={logo} className="nav-logo" />
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <React.Fragment>
      <button onClick={signInWithGoogle}>LOGIN</button>;
    </React.Fragment>
  );
}

function SignOut() {
  return (
    auth.currentUser && <button className="logout" onClick={() => auth.signOut()}>LOGOUT</button>
  );
}

function ChatRoom() {
  const dummy = useRef();

  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt");

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <React.Fragment>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit" className="send">Send</button>
      </form>
    </React.Fragment>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  );
}

export default App;
