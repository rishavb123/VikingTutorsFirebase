const functions = require('firebase-functions');
const admin = require("firebase-admin");
const algoliasearch = require('algoliasearch');
const axios = require('axios');

const config = require('./config');

admin.initializeApp();

exports.createdUser = functions.auth.user().onCreate((user) => {
    const domain = user.email.split("@")[1];
    if(domain !== "sbstudents.org" && domain !== "sbschools.org" && domain !== "bhagat.io" && domain !== "vikingtutors.com")
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

exports.moveData = functions.https.onRequest((req, res) => {
    
    let arr = [];
    let datas = []

    return admin.firestore().collection("videos").get().then((docs) => {
        return docs.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            datas.push(data);
        })
    }).then(() => {
        
        return Promise.all(datas.map(data => axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${data.videoID}&key=${config.YOUTUBE_API_KEY}`).then(resp => {
            let video = {};
            video.objectID = data.id;
            video.title = resp.data.items[0].snippet.title;
            video.description = resp.data.items[0].snippet.description;
            return arr.push(video);
        }).catch(e => console.log(e)))).then(() => {
            return res.send(JSON.stringify(arr));
        });
        
    });

});