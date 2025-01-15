async function fetchSPARQL(endpoint, query) {
    const encodedQuery = encodeURIComponent(query); // Encode query for POST request
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",  // Updated to URL-encoded
            "Accept": "application/json",
        },
        body: `query=${encodedQuery}`,  // Corrected to properly format the body
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
    console.log("Bindings:", bindings);
    const nodes = [];
    const edges = new Set(); // Use a Set to avoid duplicate edges

    bindings.forEach((row) => {
        const subjectFormatted = row.maladie ? formatURI(row.maladie.value) : null;

        // Loop through each property in the row and create nodes
        Object.keys(row).forEach((key) => {
            const value = row[key].value;
            const formattedValue = formatURI(value);

            // Add the current value as a node if not already present
            if (!nodes.find((n) => n.id === formattedValue)) {
                nodes.push({
                    id: formattedValue,
                    label: formattedValue,
                    group: key, // Group by type (maladie, symptome, traitement, etc.)
                });
            }

            // Create edges for relationships
            if (subjectFormatted && key !== "subject") {
                const edge = {
                    from: subjectFormatted,
                    to: formattedValue,
                    label: key, // Label for the edge is based on the property key
                };

                // Ensure the edge is unique
                if (![...edges].some(e => e.from === edge.from && e.to === edge.to && e.label === edge.label)) {
                    edges.add(edge);
                }
            }
        });
    });

    console.log("Nodes:", nodes);
    console.log("Edges:", [...edges]);

    // Convert edges to an array for Vis.js
    const uniqueEdges = [...edges];

    // Remove duplicate nodes
    const uniqueNodes = Array.from(new Map(nodes.map(node => [node.id, node])).values());

    // Initialize the graph with Vis.js
    const container = document.getElementById('graphContainer');
    const data = {
        nodes: new vis.DataSet(uniqueNodes),
        edges: new vis.DataSet(uniqueEdges),
    };
    const options = {
        nodes: { shape: 'dot', size: 10 },
        edges: { arrows: { to: { enabled: true } }, font: { align: 'top' } },
        physics: { enabled: true }, // Enables dynamic layout
    };

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
