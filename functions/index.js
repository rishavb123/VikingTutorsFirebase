const functions = require('firebase-functions');
const admin = require("firebase-admin");

exports.createdUser = functions.auth.user().onCreate((user) => {
    const domain = user.email.split("@")[1];
    if(domain !== "sbstudents.org" || domain !== "sbschools.org" || domain !== "bhagat.io")
        return admin.auth().deleteUser(user.uid).then(() => console.log("Deleted Invalid User")).catch(e => console.log("Error:" + e));
    else {
        user.sendEmailVerification()
        return admin.firestore().collection(domain === "sbstudents.org"? "students" : "teachers").doc().set({
            email: user.email,
            uid: user.uid
        });
    }
});