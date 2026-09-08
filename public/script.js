const SUPABASE_URL =
  "https://oxavqwwaaqewyazizgzy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_PvsPvO7q-AnqPOdDjweHxA_Q8c_E9KV";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const images = {
  "Nhà thờ Đức Bà": "images/Nha_tho_Duc_Ba.jpg",
  "Dinh Độc Lập": "images/Dinh_Doc_Lap.jpg",
  "Chợ Bến Thành": "images/Cho_Ben_Thanh.jpg"
};

const locations = {
  "Trọ của tôi": {
    lat: 10.7418,
    lng: 106.7136,
    radius: 200
  },
  "Nhà thờ Đức Bà": {
    lat: 10.7798,
    lng: 106.6990,
    radius: 100
  },

  "Dinh Độc Lập": {
    lat: 10.7770,
    lng: 106.6954,
    radius: 100
  },

  "Chợ Bến Thành": {
    lat: 10.7721,
    lng: 106.6983,
    radius: 100
  }
};

window.onload = function () {
  const select = document.getElementById("locationId");
  const image = document.getElementById("placeImage");

  if (!select || !image) {
    return;
  }

  image.src = images[select.value] || "";

  select.addEventListener("change", function () {
    image.src = images[this.value] || "";
  });
};

function checkIn() {
  const result = document.getElementById("result");
  const selected = document.getElementById("locationId").value;
  const location = locations[selected];

  result.innerText = "Đang lấy vị trí GPS...";

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const distance = getDistance(
        lat,
        lng,
        location.lat,
        location.lng
      );

      if (distance <= location.radius) {
        result.innerText = "✅ Check-in thành công tại " + selected;
        saveHistory(selected);
        showPopup(selected);
      } else {
        result.innerText =
          "❌ Bạn chưa ở đúng địa điểm\n" +
          "Khoảng cách: " +
          Math.round(distance) +
          " mét";
      }
    },
    function () {
      result.innerText = "Không lấy được GPS. Hãy cho phép quyền vị trí.";
    }
  );
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function saveHistory(placeName) {
  const historyList = document.getElementById("historyList");

  if (!historyList) {
    return;
  }

  const now = new Date();
  const time = now.toLocaleString("vi-VN");

  const item = document.createElement("div");
  item.className = "history-item";

  item.innerHTML = `
    <h4>${placeName}</h4>
    <p>${time}</p>`;

  historyList.prepend(item);
}

function showPopup(placeName) {

  document.getElementById("popup")
    .style.display = "flex";

  document.getElementById("popupText")
    .innerText =
    "Bạn đã khám phá " + placeName;
}

function closePopup() {

  document.getElementById("popup")
    .style.display = "none";
}

function showLogin() {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginTab").classList.add("active");
  document.getElementById("registerTab").classList.remove("active");
}


function showRegister() {
  document.getElementById("registerForm").classList.remove("hidden");
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerTab").classList.add("active");
  document.getElementById("loginTab").classList.remove("active");
}

async function login() {

  const email =
    document.getElementById("loginEmail").value;

  const password =
    document.getElementById("loginPassword").value;

  const message =
    document.getElementById("loginMessage");

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    message.innerText =
      "Sai email hoặc mật khẩu";
    return;
  }

  message.innerText =
    "Đăng nhập thành công";

  setTimeout(() => {
    window.location.href =
      "index.html#checkin";
  }, 1000);
}

async function register() {

  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const message = document.getElementById("registerMessage");

  console.log("EMAIL =", email);
  console.log("PASSWORD =", password);
  const { data, error } =
    await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });

  console.log(data);
  console.log(error);

  if (error) {
    message.innerText = error.message;
    return;
  }

  message.innerText =
    "Đăng ký thành công";
}

