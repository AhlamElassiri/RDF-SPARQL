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
// function drawGraph(bindings) {
//     const nodes = [];
//     const edges = [];

//     bindings.forEach(row => {
//         const subject = row.subject.value;
//         const predicate = row.predicate.value;
//         const object = row.object.value;

//         // Add nodes
//         if (!nodes.find(n => n.id === subject)) nodes.push({ id: subject, label: subject });
//         if (!nodes.find(n => n.id === object)) nodes.push({ id: object, label: object });

//         // Add edge
//         edges.push({ from: subject, to: object, label: predicate });
//     });

//     const container = document.getElementById('graph');
//     const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
//     const options = { edges: { arrows: { to: { enabled: true } } } };
//     new vis.Network(container, data, options);
// }

function formatURI(uri) {
    const hashIndex = uri.lastIndexOf("#");
    return hashIndex !== -1 ? uri.substring(hashIndex + 1) : uri;
}

function displayGraph(bindings) {
    console.log(bindings);
    // Créer les nœuds et les arêtes
    const nodes = [];
    const edges = [];

    bindings.forEach((row) => {
        // Exemple : Ajouter des nœuds et relations pour maladies et symptômes
        if (row.maladie && row.symptome) {
            nodes.push({ id: formatURI(row.maladie.value), label: formatURI(row.maladie.value), group: 'maladie' });
            nodes.push({ id: formatURI(row.symptome.value), label: formatURI(row.symptome.value), group: 'symptome' });
            edges.push({ from: formatURI(row.maladie.value), to: formatURI(row.symptome.value) });
        }

        // Ajouter des relations pour spécialistes
        if (row.maladie && row.specialiste) {
            nodes.push({ id: formatURI(row.specialiste.value), label: formatURI(row.specialiste.value), group: 'specialiste' });
            edges.push({ from: formatURI(row.maladie.value), to: formatURI(row.specialiste.value) });
        }
    });

    // Supprimer les doublons
    const uniqueNodes = Array.from(new Map(nodes.map(node => [node.id, node])).values());

    // Initialiser le graphe avec Vis.js
    const container = document.getElementById('graphContainer');
    const data = { nodes: new vis.DataSet(uniqueNodes), edges: new vis.DataSet(edges) };
    const options = { nodes: { shape: 'dot', size: 10 }, edges: { arrows: 'to' } };

    new vis.Network(container, data, options);
}


document.getElementById("queryForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const endpoint = "http://localhost:3030/OWL_medcine/sparql";
    const query = document.getElementById("queryInput").value;
    const tableHeader = document.getElementById("tableHeader");
    const tableBody = document.getElementById("tableBody");

    try {
        const json = await fetchSPARQL(endpoint, query);
        const bindings = json.results.bindings;
        // drawGraph(bindings);

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
                    td.textContent = formatURI(value.value); // Use 'value' from SPARQL JSON result
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            }
        );
        displayGraph(bindings);
        
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
