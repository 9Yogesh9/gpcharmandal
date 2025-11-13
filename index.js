const API_URL =
  "https://script.google.com/macros/s/AKfycbzv0atIeO7T0OgChoTj9W9_vqzo9IJ1zPh5hHGRYqWvIidjkJ0DNmHa1P-XGgBCUqWV/exec";
// Grab references safely (some elements may not exist on every page)
const $ = (id) => document.getElementById(id) || null;
const elements = {
  notice_board_content: $("notice_board_content"),
  todaysdate: $("todaysdate"),
  wimage: $("wimage"),
  temp: $("temp"),
  sunrise: $("sunrise"),
  sunset: $("sunset"),
  dynamicData: $("dynamicData"),
  samitiImage: $("samitiImage"),
  samitiLabel: $("samitiLabel"),
  upkramImage: $("upkramImage"),
  upkramLabel: $("upkramLabel"),
  puraskarImage: $("puraskarImage"),
  puraskarLabel: $("puraskarLabel"),
  paymentQR: $("qrImage"),
  myModal: $("exampleModal"),
  myInput: $("myInput"),
  unlockForm: $("unlockCredentials"),
  unlockModal: $("unlockModal"),
  complaintForm: $("complaintForm"),
  resolutionForm: $("resolutionForm"),
  complaintModal: $("complaint"),
  resolutionModal: $("resolutionmodal"),
  complaintList: $("complaintList"),
  complaintSearchForm: $("complaintSearchForm"),
  complaintSearchModal: $("complaintSearchModal"),
  publicComplaintContainer: $("publicComplaintContainer"),
  complaintListPublic: $("complaintList_public"),
  houseNumberForm: $("houseNumberForm"),
  houseModal: $("houseModal"),
  taxDetailModal: $("taxDetailModal"),
  logout: $("logout"),
  loginCredentials: $("loginCredentials"),
  loginModal: $("loginModal"),
  bannerContainer: $("banner_display"),
  bannerContent: $("apicalled"),
  login: $("login"),
  takrarlist: $("takrarlist"),
  multiLinkContainer: $("multi_link_container"),
  name: $("name"),
  holdId: $("holdId"),
  mobile: $("mobile"),
  details1: $("details1"),
  solution: $("solution"),
  resolutionUpdateButton: $("resolutionUpdateButton"),
  paymentButton: $("paymentButton"),
  viewCount: $("viewCount"),
  locker: $("locker"),
  gpstructuredata: $("gpstructuredata"),
  news1image: $("news1image"),
  news2image: $("news2image"),
  news1text: $("news1text"),
  news2text: $("news2text"),
};

// Cache Bootstrap modals
const modals = {
  // unlock: bootstrap.Modal.getOrCreateInstance(elements.unlockModal),
  complaint: bootstrap.Modal.getOrCreateInstance(elements.complaintModal),
  resolution: bootstrap.Modal.getOrCreateInstance(elements.resolutionModal),
  complaintSearch: bootstrap.Modal.getOrCreateInstance(
    elements.complaintSearchModal
  ),
  house: bootstrap.Modal.getOrCreateInstance(elements.houseModal),
  taxDetail: bootstrap.Modal.getOrCreateInstance(elements.taxDetailModal),
  login: bootstrap.Modal.getOrCreateInstance(elements.loginModal),
};

// Utility functions
const getTodaysDate = () => {
  const date = new Date();
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
};

const toggleLoadingBanner = (text = "") => {
  const { bannerContainer, bannerContent } = elements;
  const isVisible = bannerContainer.style.display === "flex";
  bannerContainer.style.display = isVisible ? "none" : "flex";
  bannerContent.textContent = text;
};

const toggleDisplays = () => {
  const userSession =
    JSON.parse(localStorage.getItem("userSession") || "{}").userLoggedin ||
    false;
  const { takrarlist, logout, login, multiLinkContainer } = elements;
  takrarlist.style.display = userSession ? "block" : "none";
  logout.style.display = userSession ? "block" : "none";
  login.style.display = userSession ? "none" : "block";
  multiLinkContainer.style.display = userSession ? "block" : "none";
};

const toggleSamitiURL = (url, label) => {
  samitiLabel.innerText = label;
  samitiImage.setAttribute("src", url);
};

const togglePuraskarURL = (url, label) => {
  puraskarLabel.innerText = label;
  puraskarImage.setAttribute("src", url);
};

const toggleUpkramURL = (url, label) => {
  upkramLabel.innerText = label;
  upkramImage.setAttribute("src", url);
};

const toggleResolution = (uniqueID, type) => {
  const complaints =
    type == "general"
      ? JSON.parse(localStorage.getItem("complaintsList") || "[]").filter(
        (complaint) => {
          if (complaint.UniqueID === uniqueID) return complaint;
        }
      )
      : JSON.parse(localStorage.getItem("complaints") || "[]").filter(
        (complaint) => {
          if (complaint.UniqueID === uniqueID) return complaint;
        }
      );

  const complaint = complaints[0];
  if (complaint) {
    const { name, mobile, details1, holdId, solution } = elements;
    name.value = complaint.Name;
    mobile.value = complaint["Mobile Number"];
    details1.value = complaint.Details;
    holdId.value = complaint.UniqueID;

    if (type == "general") {
      solution.value = complaint.Resolution || "आपल्या तक्रारीवर काम सुरू आहे";
      solution.readOnly = true;
      solution.classList.add("bg-dark-subtle");
      elements.resolutionUpdateButton.style.display = "none";
    } else {
      solution.value = complaint.Resolution || "";
      solution.readOnly = false;
      solution.classList.remove("bg-dark-subtle");
      elements.resolutionUpdateButton.style.display = "block";
    }
  } else {
    console.log(
      "Error happened while searching for the complaint in localdatabase " +
      uniqueID
    );
  }
};

const weatherIconMap = {
  "01d": "01",
  "01n": "01",
  "02d": "02",
  "02n": "02",
  "03d": "03",
  "03n": "03",
  "04d": "04",
  "04n": "04",
  "09d": "09",
  "09n": "09",
  "10d": "10",
  "10n": "10",
  "11d": "11",
  "11n": "11",
  "13d": "13",
  "13n": "13",
  "50d": "50",
  "50n": "50",
}

//Get views count
const getViewsAndWeather = async () => {
  const response = await fetch(`${API_URL}?Method=getViewsAndWeather`);
  let { Views, Weather, gpStructure } = await response.json();
  if (!response.ok)
    throw new Error(`Failed to fetch view count. Status: ${response.status}`);
  if (gpStructure.gpstructData.length > 0) {
    populateGPStructure(gpStructure.gpstructData);
  }
  elements.todaysdate.innerText = Weather.dt;
  elements.wimage.setAttribute("src", `asset/Weather/${weatherIconMap[Weather.icon]}.png`);
  elements.temp.innerText = Weather.temp;
  elements.sunrise.innerText = Weather.sunrise;
  elements.sunset.innerText = Weather.sunset;
  elements.viewCount.innerText = Views;
  elements.notice_board_content.style.display = "block";
};

// function loadNews() {
//   let news = [['News1', '1q4NgRCuDk5uND-JtRuh4-PwhyUJ0NVkZ'], ['News2', '1q4NgRCuDk5uND-JtRuh4-PwhyUJ0NVkZ']]

//   elements.news1image.style.background = `url('https://drive.google.com/thumbnail?id=${news[0][1]}&sz=w1000') center/cover`;
//   elements.news2image.style.background = `url('https://drive.google.com/thumbnail?id=${news[1][1]}&sz=w1000') center/cover`;
//   elements.news1text.innerText = news[0][0];
//   elements.news2text.innerText = news[1][0];
// }

function populateGPStructure(data) {
  // The table structure for GP Structure
  let structureHTML = ``;
  let firstRow = true;
  data.forEach((item) => {
    if (firstRow) {
      firstRow = false;
    } else {
      if (item[1] && item[1] != "") {
        if (item[3] != "") {
          structureHTML += `<div class="card" style="border: none;display: flex; align-items: center;margin-top: 1.3rem;">
  <div class="card-img-top structure_card_img" style="background:url('https://drive.google.com/thumbnail?id=${item[3]}&sz=w1000') center/cover; width: 11rem; height: 11rem;"></div>`
        }
        else {
          structureHTML += `<div class="card" style="border: none;display: flex; align-items: center;margin-top: 1.3rem;">
  <div class="card-img-top structure_card_img" style="background:url('asset/images/userprof.webp') center/cover; width: 11rem; height: 11rem;"></div>`
        }
        structureHTML += `
  <div class="card-body" style="padding:0px; margin-top:0.5rem;">
  <ul class="list-group list-group-flush">
  <li class="list-group-item fw-semibold name_plate" style="color:white">${item[0]}</li>
  <li class="list-group-item fw-semibold name_plate" style="color:white">${item[1]}</li>
  <li class="list-group-item fw-semibold name_plate"><a href="tel:${item[2]}" style="color: white;">${item[2]}</a></li>
  </div>
</div>`;
      }
    }
  });
  elements.gpstructuredata.innerHTML = structureHTML;
}

// Fetch complaints for admin
const fetchComplaints = async () => {
  try {
    localStorage.removeItem("complaints");
    toggleLoadingBanner("तक्रारी लोड करत आहे");
    const response = await fetch(`${API_URL}?Method=readAllData`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const { secret, gpdata } = await response.json();

    localStorage.setItem("secret", secret);
    const { complaintColumns, complaintData } = gpdata;
    const columns = complaintColumns[0];
    const complaints = complaintData.map((row) =>
      row.reduce((obj, value, index) => {
        return { ...obj, [columns[index]]: value };
      }, {})
    );

    localStorage.setItem("complaints", JSON.stringify(complaints));
    localStorage.setItem("complaint_columns", JSON.stringify(complaintColumns));
    loadComplaints();
  } catch (error) {
    console.error("Fetch complaints error:", error);
  } finally {
    toggleLoadingBanner();
  }
};

// Load complaints
const loadComplaints = () => {
  const complaints = JSON.parse(localStorage.getItem("complaints") || "[]");
  elements.complaintList.innerHTML = "";
  complaints.forEach((complaint, index) => {
    const a = document.createElement("a");
    a.textContent = `${index + 1}. नाव: ${complaint.Name}, मोबाईल: ${complaint["Mobile Number"]
      }, तपशील: ${complaint.Details}, तारीख: ${complaint.Created.substring(
        0,
        10
      )}${complaint.Resolution ? `, तक्रार निवारण: ${complaint.Resolution}` : ""
      }`;
    a.href = "#";
    a.classList.add(
      "list-group-item",
      "list-group-item-action",
      "list-group-item-primary",
      "poppins-regular",
      "col-2",
      "text-truncate"
    );
    let uniqueID = complaint.UniqueID;
    a.dataset.bsToggle = "modal";
    a.dataset.bsTarget = "#resolutionmodal";
    a.addEventListener("click", function () {
      toggleResolution(uniqueID, "admin");
    });
    elements.complaintList.appendChild(a);
  });
};

// Fetch complaint status public
const fetchComplaintStatus = async () => {
  try {
    localStorage.removeItem("userComplaintList");
    const mobile = document.getElementById("mobile_search").value.trim();
    const name = document.getElementById("name_search").value.trim();
    const uniqueID = document.getElementById("id_search").value.trim();

    elements.complaintSearchForm.reset();
    modals.complaintSearch.hide();
    toggleLoadingBanner("तुमच्या तक्रारी शोधत आहे");

    const response = await fetch(
      `${API_URL}?Method=${encodeURIComponent(
        "filteredData"
      )}&Name=${encodeURIComponent(name)}&Mobile=${encodeURIComponent(
        mobile
      )}&UniqueID=${encodeURIComponent(uniqueID)}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const rawComplaints = await response.json();
    if (rawComplaints.complaintData.length > 0) {
      const { complaintColumns, complaintData } = rawComplaints;
      const columns = complaintColumns[0];

      const complaintsList = complaintData.map((row) =>
        row.reduce((obj, value, index) => {
          return { ...obj, [columns[index]]: value };
        }, {})
      );

      localStorage.setItem("complaint_columns", JSON.stringify(complaintColumns));
      localStorage.setItem("complaintsList", JSON.stringify(complaintsList));
      elements.publicComplaintContainer.style.display = "block";
      loadPublicComplaints();
    } else {
      alert("कुठलेही तक्रारी आढळल्या नाहीत, कृपया पुन्हा प्रयत्न करा");
    }
  } catch (error) {
    console.error("Fetch complaint status error:", error);
  } finally {
    toggleLoadingBanner();
  }
};

// Load public complaints
const loadPublicComplaints = () => {
  const complaints = JSON.parse(localStorage.getItem("complaintsList") || "[]");
  elements.complaintListPublic.innerHTML = "";
  complaints.forEach((complaint, index) => {
    const a = document.createElement("a");
    a.textContent = `${index + 1}. नाव: ${complaint.Name}, मोबाईल: ${complaint["Mobile Number"]
      }, तपशील: ${complaint.Details}, तारीख: ${complaint.Created.substring(
        0,
        10
      )}${complaint.Resolution ? `, तक्रार निवारण: ${complaint.Resolution}` : ""
      }`;
    a.href = "#";
    a.classList.add(
      "list-group-item",
      "list-group-item-action",
      "list-group-item-primary",
      "text-truncate",
      "col-2"
    );
    const uniqueID = complaint.UniqueID;
    a.dataset.bsToggle = "modal";
    // a.dataset.bsTarget = "#complaintStatusModal";
    a.dataset.bsTarget = "#resolutionmodal";

    a.addEventListener("click", function () {
      toggleResolution(uniqueID, "general");
    });
    elements.complaintListPublic.appendChild(a);
  });
};

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Unlock form
  // elements.unlockForm.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   const password = document.getElementById("unlock_password").value.trim();
  //   if (password === "unlock890") {
  //     elements.locker.style.display = "none";
  //   } else {
  //     alert("Invalid Password");
  //   }
  //   elements.unlockForm.reset();
  //   modals.unlock.hide();
  // });

  // Complaint form submission
  elements.complaintForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("user_name").value.trim();
    const mobile = document.getElementById("mobile_number").value.trim();
    const details = document.getElementById("details").value.trim();
    const created = getTodaysDate();
    const uniqueID = Date.now();

    if (!/^\d{10}$/.test(mobile)) {
      alert("कृपया वैध मोबाइल नंबर एंटर करा.");
      return;
    }

    elements.complaintForm.reset();
    modals.complaint.hide();
    toggleLoadingBanner("तक्रार सबमिट करत आहे");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `Name=${encodeURIComponent(name)}&Mobile=${encodeURIComponent(
          mobile
        )}&Details=${encodeURIComponent(
          details
        )}&Method=createNewRecord&Created=${created}&UniqueID=${uniqueID}`,
      });
      const data = await response.text();
      alert(
        `तक्रार यशस्वीरित्या दाखल करण्यात आली\n तुमचा तक्रार रेफरन्स क्रमांक : ${data}`
      );
      if (
        JSON.parse(localStorage.getItem("userSession") || "{}").userLoggedin
      ) {
        fetchComplaints();
      }
    } catch (error) {
      console.error("Complaint submission error:", error);
    } finally {
      toggleLoadingBanner();
    }
  });

  // Resolution form submission
  elements.resolutionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const uniqueId = document.getElementById("holdId").value.trim();
    const resolution = document.getElementById("solution").value.trim();

    try {
      toggleLoadingBanner("तक्रार अपडेट करत आहे");
      elements.resolutionForm.reset();
      modals.resolution.hide();

      const complaints = JSON.parse(localStorage.getItem("complaints") || "[]");
      const complaintToUpdate = complaints.find((c) => c.UniqueID == uniqueId);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `Resolution=${encodeURIComponent(
          resolution
        )}&UniqueID=${encodeURIComponent(
          complaintToUpdate.UniqueID
        )}&Method=updateResolution&Updated=${getTodaysDate()}`,
      });

      if (response.ok) {
        complaintToUpdate.Resolution = resolution;
        localStorage.setItem("complaints", JSON.stringify(complaints));
        loadComplaints();
        alert("तक्रार यशस्वीपणे अपडेट केली");
      }
    } catch (error) {
      console.error("Resolution update error:", error);
    } finally {
      toggleLoadingBanner();
    }
  });

  // Complaint status form
  elements.complaintSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    fetchComplaintStatus();
  });

  // House number form
  elements.houseNumberForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const houseNumber = document.getElementById("houseNumber").value.trim();
    modals.house.hide();
    toggleLoadingBanner("कर माहिती शोधत आहे");

    try {
      const response = await fetch(
        `${API_URL}?Method=getTaxDetails&HouseNumber=${encodeURIComponent(
          houseNumber
        )}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.dataFound) {
        for (const [field, value] of Object.entries(data)) {
          const element = document.getElementById(field);
          if (element) element.textContent = value;
        }
        elements.paymentQR.setAttribute(
          "src",
          `https://quickchart.io/qr?text=upi%3A%2F%2Fpay%3Fpn%3DGPCharmandal%26pa%3Dboism-9604034441%40boi%26am%3D${data.totalTax}&size=160`
        );
        elements.paymentButton.href = `upi://pay?pn=Yogesh&pa=havefun@axisb&cu=INR&am=${data.totalTax}`;
        modals.taxDetail.show();
      } else {
        alert("अयोग्य घर क्रमांक, कृपया पुन्हा प्रयत्न करा");
      }
    } catch (error) {
      console.error("Tax details fetch error:", error);
    } finally {
      toggleLoadingBanner();
    }
  });

  // Logout
  elements.logout.addEventListener("click", () => {
    localStorage.setItem(
      "userSession",
      JSON.stringify({ userLoggedin: false })
    );
    toggleDisplays();
  });

  // Login
  elements.loginCredentials.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("password").value.trim();
    toggleLoadingBanner("प्रवेश तपासत आहे");
    elements.loginCredentials.reset();
    modals.login.hide();
    const response = await fetch(
      `${API_URL}?Method=${encodeURIComponent(
        "getAdminToken"
      )}&adminKey=${encodeURIComponent(password)}`
    );

    if (!response.ok)
      throw new Error(`HTTP errorin validating admin: ${response.status}`);
    const data = await response.text();
    if (data === "access granted") {
      localStorage.setItem(
        "userSession",
        JSON.stringify({ userLoggedin: true })
      );
      toggleLoadingBanner();
      sessionExpiration();
      fetchComplaints();
      toggleDisplays();
    } else {
      alert("Invalid Password");
    }
  });

  // Session expiration
  const sessionExpiration = () => {
    setTimeout(() => {
      localStorage.setItem(
        "userSession",
        JSON.stringify({ userLoggedin: false })
      );
      alert("Session Expired !");
      toggleDisplays();
    }, 60 * 60 * 1000);
  };

  // Initial load
  getViewsAndWeather();
  // loadNews();
  loadComplaints();
  toggleDisplays();

  // --- Inline validations merged from validations.js ---
  // Generic input validation function
  function validateInput(inputElement, validator) {
    if (!inputElement) return;
    inputElement.addEventListener("input", () => {
      const value = inputElement.value.trim();
      const isValid = validator(value);

      inputElement.classList.toggle("is-valid", isValid);
      inputElement.classList.toggle("is-invalid", !isValid);
    });
  }

  // Name validation
  validateInput($("user_name"), (value) =>
    /^[\p{L}]{2,}(?: [\p{L}]+)*$/u.test(value)
  );

  // Mobile number validation (10 digits)
  [$("mobile_number"), $("mobile_search")].forEach((input) => {
    validateInput(input, (value) => /^\d{10}$/.test(value));
  });

  // Unique ID validation (13 characters)
  validateInput($("id_search"), (value) => value.length === 13);

  // Lazy-load images: add loading="lazy" to large images
  document.querySelectorAll &&
    document.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });
  // --- end validations ---
});