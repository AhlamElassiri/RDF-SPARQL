async function fetchSPARQL(endpoint, query) {
    const encodedQuery = encodeURIComponent(query); // Encode query for POST request
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",  // Updated to URL-encoded
            "Accept": "application/json",
        },
        body: `query=${encodedQuery}`,  // Query encoded in the body
    });

    if (!response.ok) {
        throw new Error(`Erreur : ${response.statusText}`);
    }

    return await response.json();
}

document.getElementById("queryForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const endpoint = "http://localhost:3030/ontologieDataset/sparql";
    const query = document.getElementById("queryInput").value;
    const tableHeader = document.getElementById("tableHeader");
    const tableBody = document.getElementById("tableBody");

    try {
        const json = await fetchSPARQL(endpoint, query);
        const bindings = json.results.bindings;

        // Reset table
        tableHeader.innerHTML = "";
        tableBody.innerHTML = "";

        if (bindings.length > 0) {
            // Generate headers dynamically
            Object.keys(bindings[0]).forEach(key => {
                const th = document.createElement("th");
                th.textContent = key;
                tableHeader.appendChild(th);
            });

            // Populate rows
            bindings.forEach(row => {
                const tr = document.createElement("tr");
                Object.values(row).forEach(value => {
                    const td = document.createElement("td");
                    td.textContent = value.value; // Use 'value' from SPARQL JSON result
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        } else {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.textContent = "Aucun résultat trouvé.";
            td.colSpan = "100%";
            tr.appendChild(td);
            tableBody.appendChild(tr);
        }
    } catch (error) {
        console.error(error);
        alert(`Erreur lors de l'exécution de la requête : ${error.message}`);
    }
});
