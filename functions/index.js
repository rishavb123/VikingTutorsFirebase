const functions = require('firebase-functions');
const admin = require("firebase-admin");

exports.createdUser = functions.auth.user().onCreate((user) => {
    const domain = user.email.split("@")[1];
    const name = user.displayName.split(" ");
    if(domain !== "sbstudents.org" || domain !== "sbschools.org" || domain !== "bhagat.io")
        return admin.auth().deleteUser(user.uid).then(() => console.log("Deleted Invalid User")).catch(e => console.log("Error:" + e));
    else {
        user.sendEmailVerification()
        if(domain === "sbstudents.org")
            return admin.firestore().collection("students").doc().set({
                email: user.email,
                name: {
                    first: name[0],
                    last: name[1]
                },
                uid: user.uid
            });
        else
            return admin.firestore().collection("teachers").doc().set({
                email: user.email,
                name: {
                    first: name[0],
                    last: name[1]
                },
                uid: user.uid
            });
    }
});