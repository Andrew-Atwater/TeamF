import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase-config';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TransactionHistory from './pages/TransactionHistory';

const App: React.FC = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Home /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/transactions" element={user ? <TransactionHistory /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;