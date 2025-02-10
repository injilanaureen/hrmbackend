import mongoose from 'mongoose';

export default function MongoDB({ url }) {
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connection established");
  })
  .catch((err) => {
    console.error("MongoDB error: ", err.message);
    process.exit(1); // Exit process if connection fails
  });
}
