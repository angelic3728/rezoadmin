// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
// We only want to use Firebase Auth here
import "firebase/auth";
import "firebase/database";
import 'firebase/firestore';
import 'firebase/storage';

// Your app's Firebase configuration
// var firebaseConfig = {
//     apiKey: "AIzaSyAcXjQACiSWFFHbJuHIEeDtgc2Cmmri5oM",
//     authDomain: "meditation-app-34538.firebaseapp.com",
//     databaseURL: "https://meditation-app-34538.firebaseio.com",
//     projectId: "meditation-app-34538",
//     storageBucket: "meditation-app-34538.appspot.com",
//     messagingSenderId: "869508202761",
//     appId: "1:869508202761:web:44ed26c6f624ded27113d8",
//     measurementId: "G-VX90RN1JRC"
// };
var firebaseConfig = {
    apiKey: "AIzaSyBXdBTD6iSLSSQyhw1eavxfIB0HrH2Bm8A",
	authDomain: "rezoapp-55b4e.firebaseapp.com",
	databaseURL: "https://rezoapp-55b4e.firebaseio.com",
	projectId: "rezoapp-55b4e",
	storageBucket: "rezoapp-55b4e.appspot.com",
	messagingSenderId: "170645379714",
	appId: "1:170645379714:web:bc0693f4b1271b50d8329b",
	measurementId: "G-J27TWXWFJR"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Storage
var storageRef = firebase.storage().ref();

// Finally, export it to use it throughout your app
export { storageRef };
export default firebase;
