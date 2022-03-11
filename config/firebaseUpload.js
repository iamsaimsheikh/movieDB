// Importing Libraries
const firebaseAdmin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');


// Importing creditions.json file
const serviceAccount = require('./moviedb-96a88-firebase-adminsdk-5nqma-e3eb78cc4c.json');

// initialize app
const admin = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});

// Storage reference
const storageRef = admin.storage().bucket(`gs://moviedb-96a88.appspot.com`);

// Upload Function
async function uploadFile(path, filename) {
    const storage = await storageRef.upload(path, {
        public: true,
        destination: `/uploads/hashnode/${filename}`,
        metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
        }
    });

    return storage[0].metadata.mediaLink;
    
}

module.exports = uploadFile