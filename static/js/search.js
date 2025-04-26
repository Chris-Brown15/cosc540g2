const input = document.getElementById("combo-input");
const dropdown = document.getElementById("dropdown");
const recentKey = "recent-searches";

// Store recent searches in local storage
function saveRecentSearch(search) {
  const recent = JSON.parse(localStorage.getItem(recentKey)) || [];
  // Filter out possible duplicate searches
  const filteredRecent = recent.filter((r) => r !== search);
  // Store up to 10 searches
  const updated = [search, ...filteredRecent].slice(0, 10);
  localStorage.setItem(recentKey, JSON.stringify(updated));
}

// Render recent searches
function renderDropdown(items = []) {
  dropdown.innerHTML = "";

  if (items.length > 0) {
    items.forEach((item) => {
      const li = document.createElement("li");

      // Label
      const label = document.createElement("span");
      label.textContent = item;

      // Handle clicking the list item (search)
      li.onclick = () => {
        input.value = item;
        dropdown.style.display = "none";
        executeSearch(item);
      };

      li.appendChild(label);
      dropdown.appendChild(li);
    });

    dropdown.style.display = "block";
  } else {
    dropdown.style.display = "none";
  }
}

function removeRecentSearch(search) {
  const recent = JSON.parse(localStorage.getItem(recentKey)) || [];
  const updated = recent.filter((r) => r !== search);
  localStorage.setItem(recentKey, JSON.stringify(updated));
}


function updateSearchParams(query) {
  const url = new URL(window.location);
  if (query) {
    url.searchParams.set("search", query);
  } else {
    url.searchParams.delete("search");
  }
  window.history.pushState({}, "", url);
}

async function executeSearch(query) {
  try {
    updateSearchParams(query);

    const apiUrl = query ? `/api/inventory?search=${encodeURIComponent(query)}` : '/api/inventory';
    const response = await fetch(apiUrl);
    const { data } = await response.json();

    renderListings(data);

    if (query) {
      saveRecentSearch(query);
    }
  } catch (error) {
    console.error("Search failed:", error);
  }
}

// Events
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const query = input.value.trim();
    executeSearch(query);
    dropdown.style.display = "none";
  }
});

input.addEventListener("input", () => {
  const query = input.value.trim();

  if (!query) {
    const recent = JSON.parse(localStorage.getItem(recentKey)) || [];
    renderDropdown(recent);
  } else {
    dropdown.style.display = "none";
  }
});

input.addEventListener("focus", () => {
  const query = input.value.trim();

  if (!query) {
    const recent = JSON.parse(localStorage.getItem(recentKey)) || [];
    renderDropdown(recent);
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".combo-box")) {
    dropdown.style.display = "none";
  }
});
