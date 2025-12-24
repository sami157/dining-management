import {  useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, GoogleAuthProvider } from "firebase/auth";
import { AuthContext } from './AuthContext.jsx';
import { auth } from '../../firebase/firebase.init.js';

const provider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState()
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            setErrorMessage('');
        });
        return () => unsubscribe();
    },[]);


    const createUser = async (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    const signInUser = (email, password) => {
            return signInWithEmailAndPassword(auth, email, password)
    }

    const signOutUser = () => {
        return signOut(auth)
    }

    const updateUserProfile = (name, image) => {
        if (name || image) {
            return updateProfile(authData.auth.currentUser, {
                displayName: name && name,
                photoURL: image && image
            })
        }
        else return Promise.reject()
    }

    const authData = {
        auth,
        user,
        setUser,
        loading,
        createUser,
        signInUser,
        signOutUser,
        setErrorMessage,
        errorMessage,
        updateUserProfile
    }
    return (
        <AuthContext value={authData}>
            {children}
        </AuthContext>
    );
};

export default AuthProvider;