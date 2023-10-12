/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const app = express();
app.use(cors( { origin: true } )); //^ this will allow cross origin resorce sharable

// main database reference
const db = admin.firestore();

//Routes
app.get('/', (req, res) =>{
    return res.status(200).send("Api Working Perfeclty");
});

// create -> post()
app.post("/api/create", (req, res) =>{
    (async ()=> {
        try {
            const date = Date.now();
            // await db.collection('userDetails').doc(`/${date}/`).collection('test').doc("test1").create
            await db.collection('userDetails').doc(`/${date}/`).create({
                id: date,
                name: req.body.name,
                mobile: req.body.mobile,
                address: req.body.address
            });

            return res.status(200).send({ status:"success", msg:"Data Saved" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ status:"failed", msg:error });
            // return res.status(500).send("Internal server error!");
        }
    })();
});

// get -> get()
app.get("/api/getDetail", (req, res) =>{
    (async ()=>{
        try {
            const reqDoc = db.collection('userDetails').doc(req.query.id);
            
            let userDetail = await reqDoc.get();
            let response = userDetail.data();
            console.log(response);
            return res.status(200).send({ status:"success", data: response });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ status:"failed", msg:error });
        }
    })();
});

app.get("/api/getAll", (req, res) =>{
    (async ()=>{
        try {
            const query = db.collection('userDetails');
            let response = [];

            await query.get().then((data) =>{
                let docs = data.docs;

                docs.map((doc) => {
                    const selectedItem = {
                        id: doc.data().id,
                        name: doc.data().name,
                        mobile: doc.data().mobile,
                        address: doc.data().address
                    };

                    response.push(selectedItem);
                });
                return response;
            });

            return res.status(200).send({ status:"success", data: response });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ status:"failed", msg:error });
        }
    })();
});

// update -> put()
app.put("/api/update", (req, res) =>{
    (async ()=> {
        try {
            const reqDoc = db.collection('userDetails').doc(req.body.id);
            
            await reqDoc.update({
                name: req.body.name,
                mobile: req.body.mobile,
                address: req.body.address
            });

            return res.status(200).send({ status:"success", msg:"Data updated" });
        } catch (error) {
            return res.status(500).send({ status:"failed", msg:error.message });
            // return res.status(500).send("Internal server error!");
        }
    })();
});

// delete -> delete()
app.delete("/api/delete/:id", (req, res) =>{
    (async ()=> {
        try {
            const reqDoc = db.collection('userDetails').doc(req.params.id);
            await reqDoc.delete();

            return res.status(200).send({ status:"success", msg:"Data Deleted" });
        } catch (error) {
            return res.status(500).send({ status:"failed", msg:error.message });
            // return res.status(500).send("Internal server error!");
        }
    })();
});

//exports the api to firebase cloud functions
exports.app = functions.https.onRequest(app);