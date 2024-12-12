import tkinter as tk
from tkinter import ttk
from SPARQLWrapper import SPARQLWrapper, JSON

# Fonction pour exécuter une requête SPARQL et retourner les résultats sous forme de texte
def run_sparql_query(query):
    sparql = SPARQLWrapper("http://dbpedia.org/sparql")  # Endpoint DBpedia
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    try:
        # Exécution de la requête
        results = sparql.query().convert()
        
        # Vérification si des résultats existent
        if "results" in results and "bindings" in results["results"]:
            result_text = ""
            # Parcourir les résultats et afficher les valeurs et les liens
            for result in results["results"]["bindings"]:
                result_line = ""
                for key, value in result.items():
                    if "value" in value:
                        result_line += f"{key.capitalize()}: {value['value']} | "
                result_text += result_line.rstrip(' | ') + "\n"
            return result_text
        else:
            return "Aucun résultat trouvé pour cette requête."
    except Exception as e:
        return f"Erreur lors de l'exécution de la requête : {e}"

# Fonction pour exécuter la requête SPARQL saisie par l'utilisateur
def on_query_button_click():
    user_query = query_entry.get()  # Récupérer la requête SPARQL entrée par l'utilisateur

    if user_query:  # Si une requête a été saisie
        result = run_sparql_query(user_query)
        result_text.delete(1.0, tk.END)  # Efface les anciens résultats
        result_text.insert(tk.END, result)  # Affiche les nouveaux résultats
    else:
        result_text.delete(1.0, tk.END)  # Efface les anciens résultats
        result_text.insert(tk.END, "Veuillez saisir une requête SPARQL.")

# Création de la fenêtre principale
root = tk.Tk()
root.title("Exécuter une requête SPARQL sur DBpedia")

# Création du cadre pour la saisie de la requête
frame = ttk.Frame(root, padding="10")
frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

# Label et champ de saisie pour la requête SPARQL
query_label = ttk.Label(frame, text="Saisissez votre requête SPARQL:")
query_label.grid(row=0, column=0, padx=5, pady=5)

query_entry = ttk.Entry(frame, width=50)
query_entry.grid(row=0, column=1, padx=5, pady=5)

# Bouton pour exécuter la requête
query_button = ttk.Button(frame, text="Exécuter la requête", command=on_query_button_click)
query_button.grid(row=1, column=0, columnspan=2, pady=10)

# Zone de texte pour afficher les résultats
result_text = tk.Text(frame, width=50, height=10, wrap=tk.WORD)
result_text.grid(row=2, column=0, columnspan=2, padx=5, pady=5)

# Lancer l'application
root.mainloop()
