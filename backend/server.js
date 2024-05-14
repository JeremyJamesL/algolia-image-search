const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const vision = require("@google-cloud/vision");

// Vision API
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: "key.json",
});

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:1234" }));

// Routes
app.post("/image-search", async (req, res) => {
  const visionResponse = await visionClient.labelDetection(req.body.image);

  if (!visionResponse) {
    return res.status(400).send("something went wrong!");
  }

  // Data transformation
  const newItemArray = visionResponse[0].labelAnnotations.map((el) => {
    return el.description;
  });

  res.status(200).send(newItemArray);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
