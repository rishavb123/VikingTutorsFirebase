const functions = require('firebase-functions');
const admin = require("firebase-admin");

admin.initializeApp();

exports.createdUser = functions.auth.user().onCreate((user) => {
    const domain = user.email.split("@")[1];
    if(domain !== "sbstudents.org" && domain !== "sbschools.org" && domain !== "bhagat.io")
        return admin.auth().deleteUser(user.uid).then(() => console.log("Deleted Invalid User")).catch(e => console.log("Error:" + e));
    else {
        const c = domain === "sbstudents.org"? "students" : "teachers"
        return admin.firestore().collection(c).where("email", '==', user.email).get().then(querySnapshot => {
            if(querySnapshot.size === 0)
                return admin.firestore().collection(c).doc().set({
                    email: user.email,
                    uid: user.uid
                });
            else
                return 0;
        });
    }
});