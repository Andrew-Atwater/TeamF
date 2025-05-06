import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  TextField,
  Typography,
  Snackbar,
  Alert
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

import {auth} from "../firebase-config";
import {useSignInWithGoogle, useCreateUserWithEmailAndPassword} from 'react-firebase-hooks/auth';

import {db} from '../firebase-config';
import {collection, addDoc} from 'firebase/firestore';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
  const [createUserWithEmailAndPassword, , emailLoading, emailError] = useCreateUserWithEmailAndPassword(auth);

  const handleErrorClose = () => {
    setOpenErrorSnackbar(false);
  };

  const handleEmailRegister = async () => {
    try {
      // Basic validation
      if (!name || !email || !password) {
        setErrorMessage("Please fill in all fields");
        setOpenErrorSnackbar(true);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(email, password);
      
      if (userCredential && userCredential.user) {
        // Add user to Firestore
        await addDoc(collection(db, "user"), {
          uid: userCredential.user.uid,
          name: name,
          email: email,
          createdAt: new Date().toISOString()
        });

        // Navigate to main menu after successful registration
        navigate('/');
      }
    } catch (error: any) {
      console.error("Full registration error:", error);
      setErrorMessage(error.message || "Registration failed. Please try again.");
      setOpenErrorSnackbar(true);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result && result.user) {
        await addDoc(collection(db, "user"), {
          uid: result.user.uid,
          name: result.user.displayName || name,
          email: result.user.email,
          createdAt: new Date().toISOString()
        });

        // Navigate to main menu after successful Google registration
        navigate('/');
      }
    } catch (error: any) {
      console.error("Full Google registration error:", error);
      setErrorMessage(error.message || "Google registration failed. Please try again.");
      setOpenErrorSnackbar(true);
    }
  };

  // Show error messages from Firebase hooks
  React.useEffect(() => {
    if (googleError) {
      setErrorMessage(googleError.message);
      setOpenErrorSnackbar(true);
    }
    if (emailError) {
      setErrorMessage(emailError.message);
      setOpenErrorSnackbar(true);
    }
  }, [googleError, emailError]);

  return (
    <>
      <Container maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            mt: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.light" }}>
            <LockOutlined />
          </Avatar>
          <Typography variant="h5">Register</Typography>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleEmailRegister}
              disabled={emailLoading || googleLoading}
            >
              Register
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={()=>{
                alert("*mario music plays*");
              }}
              disabled={emailLoading || googleLoading}
            >
              Register With Google
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/login">Already have an account? Login</Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleErrorClose} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Register;