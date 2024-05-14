import algoliasearch from "algoliasearch/lite";
import instantsearch from "instantsearch.js";
import { searchBox, hits } from "instantsearch.js/es/widgets";

// Vars
let imageToSendToVisionAPI = "";

// DOM
const cameraIcon = document.getElementById("camera");
const modal = document.getElementById("modal");
const dropArea = document.getElementById("drop-area");
const dropImage = document.getElementById("drop-image");
const searchByImageBtn = document.getElementById("image-search-btn");
const triggerSearch = document.getElementById("trigger");

// Algolia
const searchClient = algoliasearch(
  "YSWWVAX5RB",
  "9fb3db0222f7b5aef0e2b30791ee6201"
);

const search = instantsearch({
  indexName: "federated_ecomm_PRODUCTS",
  searchClient,
});

search.addWidgets([
  searchBox({
    container: "#searchbox",
    placeholder: "Starting typing...",
    showReset: false,
    showSubmit: false,
    cssClasses: {
      input:
        "border border-gray-300 rounded p-2 w-full text-black p-4 font-family-inherit",
    },
  }),

  hits({
    container: "#hits",
    cssClasses: {
      list: "grid grid-cols-4 gap-6",
      item: "shadow-lg p-4 rounded flex justify-center items-center flex-col",
    },
    templates: {
      item(hit, { html, components }) {
        return html`
          <img src="${hit.image_urls[0]}" class="max-w-40 h-auto mb-2" />
          <h2>${hit.name}</h2>
        `;
      },
    },
  }),
]);

search.start();

// Event handler functions
function openModal() {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function onDrop(e) {
  e.stopPropagation();
  e.preventDefault();
  const imageURL = e.dataTransfer.getData("text/html");
  const rex = /src="?([^"\s]+)"?\s*/;
  urlsAfterRegex = rex.exec(imageURL);
  imageToSendToVisionAPI = urlsAfterRegex[1];
  dropImage.src = imageToSendToVisionAPI;

  searchByImageBtn.classList.remove("hidden");
  searchByImageBtn.classList.add("block");
}

function onDragOver(e) {
  console.log("on dragover");
  e.preventDefault();
}

async function handleImageSearchClick() {
  try {
    const response = await fetch("http://localhost:3000/image-search", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageToSendToVisionAPI,
      }),
    });
    const data = await response.json();
    search.helper.setQuery(`${data[0]} ${data[1]} ${data[2]}`).search();
    modal.classList.remove("flex");
    modal.classList.add("hidden");
  } catch (err) {
    console.log("something went wrong:", err);
  }
}

// function triggerNewSearch() {
//   search.helper.setQuery("shoe").search();
// }

// Event listeners
cameraIcon.addEventListener("click", openModal);
dropArea.addEventListener("dragover", onDragOver, false);
dropArea.addEventListener("drop", onDrop);
searchByImageBtn.addEventListener("click", handleImageSearchClick);
triggerSearch.addEventListener("click", triggerNewSearch);
