import React, { useEffect, useState } from 'react';
import { db, collection, addDoc, onSnapshot, query, where, getDocs  } from './config';
import { Link } from 'react-router-dom';
import { Button, Box, Heading, Input, VStack } from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';
import { serverTimestamp } from 'firebase/firestore';


const Preview = () => {
  const [newCommunity, setNewCommunityName] = useState([]);
  const [communities, setCommunities] = useState([]);
  const username = localStorage.getItem("username");
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);
  useEffect(() => {
    if(!localStorage.getItem("username")) {
      setRedirectToDashboard(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const unsubscribe = onSnapshot(collection(db, 'messages'), (snapshot) => {
            const updatedCommunities = new Set();
            snapshot.forEach(doc => {
            updatedCommunities.add(doc.data().community);
            });
            setCommunities([...updatedCommunities]);
          });
      
          return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [username]);


  const log = () => {
    localStorage.removeItem("username");
    setRedirectToDashboard(true);
  }
  const AddCom = async (event) => {
    event.preventDefault();
    if (!newCommunity.trim()) return;
    try {
      const q = query(collection(db, 'messages'), where('community', '==', newCommunity));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        const commRef = collection(db, 'messages'); 
        await addDoc(commRef, {
          community: newCommunity,
          message: `Hello there! Welcome to the ${newCommunity} community. Please feel free to be open and converse with the people and me.`,
          name: "JARVIS",
          time: serverTimestamp()
        });
        setNewCommunityName("");
      } else {
        setNewCommunityName("");
      }
        
      } catch (error) {
        console.error('Error adding document:', error);
      }
    
  };

  if (redirectToDashboard) {
    return <Navigate to="/" />;
  }

  return (
    <Box
  h="60vh"
  bg="gray.800"
  color="white"
  display="flex"
  flexDirection="column"
  justifyContent="flex-start"
  alignItems="center"
  padding="40px"
  marginTop="4%"
>
  <Heading mb="2">Join your Highway community!</Heading>
  <VStack alignItems="center" marginTop="4">
    {communities.map((community, index) => (
      <Link key={index} to={`/chat?room=${community}`} style={{ textDecoration: "none" }}>
        <Button
          colorScheme="teal"
          variant="outline"
          size="lg"
          width="130px"
          height="30px"
          borderRadius="8px"
          _hover={{ bg: "teal.500" }}
          marginBottom="-2%"
          marginTop = "19%"
        >
          {community} Community
        </Button>
      </Link>
    ))}
  </VStack>
  <Input
    value={newCommunity}
    onChange={(e) => setNewCommunityName(e.target.value)}
    placeholder="Enter new community name"
    marginTop="3%"
    size="lg"
    width="195px"
    height="30px"
    bg="white"
    color="black"
    borderRadius="8px"
    _placeholder={{ color: "gray.500" }}
    marginBottom="6px"
  />
  <Button
    colorScheme="teal"
    size="lg"
    marginTop="6"
    onClick={AddCom}
    borderRadius="8px"
    _hover={{ bg: "teal.500" }}
    width="200px"
    height="30px"
    padding="10px"
  > Add Community</Button>
    <Button
    colorScheme="teal"
    size="lg"
    marginTop="6"
    onClick={log}
    borderRadius="8px"
    _hover={{ bg: "teal.500" }}
    width="200px"
    height="30px"
    padding="10px"
  >
    Log Out
  </Button>
</Box>






  );
};

export default Preview;