import React, { useEffect, useState, useRef } from "react";
import { db } from "./config";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  limit,
  serverTimestamp,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

import { Box, Input, Button, VStack, HStack, IconButton, Text, ChakraProvider } from '@chakra-ui/react';
import { FaPaperPlane } from 'react-icons/fa';
import { Navigate } from 'react-router-dom';
import OpenAI from "openai";
import "./App.css"

const Chat = () => {
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);
  useEffect(() => {
    if(!localStorage.getItem("username")) {
      setRedirectToDashboard(true);
    }
  }, []);
  const [room, setRoom] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesRef = collection(db, "messages");
  const name = localStorage.getItem("username");
  const openai = new OpenAI({ apiKey: "**" , dangerouslyAllowBrowser:true});
  const messagesEndRef = useRef(null);

  async function main(newMessage) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Your name is JARVIS and are now a convener of an online" + {room} + " chatroom. Consider the room ur in and reply to the request in no more than 30 words to the following message."+ newMessage }],
      stream: false,
    });
  
    try {
      const generatedText = completion['choices'][0]['message']['content'];
      console.log(generatedText);
      const newDoc = doc(messagesRef);
      await setDoc(newDoc, {
        community: room,
        message: generatedText,
        name: "JARVIS",
        time: serverTimestamp()
      });

    } catch (error) {
      console.error('Error:', error);
      console.log(completion)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get("room");
    if (roomParam) {
      setRoom(roomParam);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        messagesRef,
        where("community", "==", room),
        orderBy("time", "asc")
      ),
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messages);
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );
  
    return () => unsubscribe();
  }, [room]);

  
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newMessage.trim()) return;
    if(newMessage.length > 0 && newMessage.toUpperCase().includes("JARVIS")) {
      try {
        main(newMessage.trim());
        const newDoc = doc(messagesRef);
        await setDoc(newDoc, {
          community: room,
          message: newMessage,
          name: name,
          time: serverTimestamp()
        });
        setNewMessage("");
      } catch (error) {
        console.error("Error adding message:", error);
      }
    } else {
      try {
        const newDoc = doc(messagesRef);
        await setDoc(newDoc, {
          community: room,
          message: newMessage,
          name: name,
          time: serverTimestamp()
        });
        setNewMessage("");
      } catch (error) {
        console.error("Error adding message:", error);
      }
    }
  };

  if (redirectToDashboard) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div style={{ textAlign: "center", width: "100%", padding: "20px", boxSizing: "border-box", color: "white" }}>
      <h1>{room} room</h1>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {messages.map((message) => (
          <div key={message.id} style={{ maxWidth: "30%", minWidth: "30%", backgroundColor: "blue", borderRadius: "10px", padding: "10px", marginBottom: "5px", textAlign: "left" }}>
            <h5 style={{ marginBottom: "2px", marginTop: "5px" }}>{message.name}</h5>
            <h4 style={{ margin: "0", marginBottom: "5px" }}>{message.message}</h4>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "20px", textAlign: "center" }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(e);
            }
          }}
          style={{ width: "23%", padding: "10px", borderRadius: "20px", border: "none", backgroundColor: "white", color: "black", marginRight: "5px" }}
        />
        <button
  onClick={handleSubmit}
  aria-label="Send"
  style={{
    backgroundColor: "black",
    color: "white",
    border: "none",
    borderRadius: "20px",
    padding: "15px",
    width: "100px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    outline: "none",
  }}
  onMouseEnter={(e) => { e.target.style.backgroundColor = "#333"; }}
  onMouseLeave={(e) => { e.target.style.backgroundColor = "black"; }}
>
  Send
</button>
      </div>
    </div>
  );
};

export default Chat;
