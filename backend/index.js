const algolia = require("algoliasearch");
const vision = require("@google-cloud/vision");
const fs = require("fs");

const algoliaClient = algolia("YSWWVAX5RB", "4203de3b08b981c149883b0af830db30");
const index = algoliaClient.initIndex("federated_ecomm_PRODUCTS_IMAGESEARCH");

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: "key.json",
});

async function imageToLabels(img, objectID) {
  try {
    // Call Google Vision API
    const res = await visionClient.labelDetection(img);

    // Data transformation
    const newItemArray = res[0].labelAnnotations.map((el) => {
      return el.description;
    });
    const newObjectWithTags = {
      image_tags: newItemArray,
      objectID,
    };

    // Update record in index
    const data = await index.partialUpdateObject(newObjectWithTags);
    console.log(`${data.objectID} was updated successfully in the index`);
  } catch (err) {
    console.log(err, "in imageToLabels");
  }
}

function main() {
  index.browseObjects({
    query: "",
    attributesToRetrieve: ["objectID", "image_urls"],
    batch: (batch) => {
      batch.forEach(async (el) => {
        await imageToLabels(el.image_urls[0], el.objectID);
      });
    },
  });
}

main();
