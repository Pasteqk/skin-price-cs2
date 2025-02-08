document.addEventListener("DOMContentLoaded", () => {
    loadSkins();

    document.getElementById("add-skin-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const listingID = document.getElementById("listing-id").value.trim();
        if (listingID) {
            await addSkin(listingID);
            document.getElementById("listing-id").value = ""; // Clear input
        }
    });
});

async function loadSkins() {
    try {
        const response = await fetch("/get-skins");
        const skins = await response.json();

        const skinContainer = document.getElementById("skins-container");
        skinContainer.innerHTML = ""; // Clear existing skins

        skins.forEach((skin) => {

            const skinElement = document.createElement("div");
            skinElement.classList.add("skin-item");
            skinElement.innerHTML = `
                <img src="${skin.image_url}" alt="${skin.name}">
                <p><strong>${skin.name}</strong></p>
                <p>Wear: ${skin.wear}</p>
                <p>Float: ${skin.float.toFixed(5)}</p>
                <p>Price: $<span class="price-value">${(skin.price / 100).toFixed(2)}</span></p>
                <a href="${skin.inspect_link}" target="_blank">Inspect</a>
                <button class="edit-skin" data-id="${skin.id}">✏️</button>
                <button class="delete-skin" data-id="${skin.id}">🗑️</button>
            `;

            skinContainer.appendChild(skinElement);
        });

        // Attach event listeners to edit and delete buttons
        document.querySelectorAll(".delete-skin").forEach(btn =>
            btn.addEventListener("click", () => deleteSkin(btn.dataset.id))
        );

        document.querySelectorAll(".edit-skin").forEach(btn =>
            btn.addEventListener("click", () => editSkin(btn.dataset.id))
        );

    } catch (error) {
        console.error("Error fetching skins:", error);
    }
}

async function addSkin(listingID) {
    try {
        console.log(`Fetching skin for listing ID: ${listingID}`);

        const response = await fetch(`/scrape-skin?id=${listingID}`);
        const skinData = await response.json();

        console.log("Fetched Skin Data:", skinData);

        if (!skinData || !skinData.listing_id) {
            throw new Error("Invalid skin data received");
        }

        const saveResponse = await fetch("/add-skin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(skinData),
        });

        if (!saveResponse.ok) {
            throw new Error("Failed to add skin");
        }

        console.log("Skin added successfully!");
        loadSkins();
    } catch (error) {
        console.error("Error adding skin:", error);
    }
}

async function deleteSkin(skinId) {
    try {
        const response = await fetch(`/delete-skin/${skinId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete skin");
        loadSkins();
    } catch (error) {
        console.error("Error deleting skin:", error);
    }
}

async function editSkin(skinId) {
    const newPrice = prompt("Enter new price in cents:");
    if (newPrice && !isNaN(newPrice)) {
        try {
            const response = await fetch(`/edit-skin/${skinId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ price: parseInt(newPrice) }),
            });
            if (!response.ok) throw new Error("Failed to edit skin");
            loadSkins();
        } catch (error) {
            console.error("Error editing skin:", error);
        }
    }
}
