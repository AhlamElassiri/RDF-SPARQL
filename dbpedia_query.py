import tkinter as tk
from tkinter import ttk
from SPARQLWrapper import SPARQLWrapper, JSON

# Fonction pour exécuter une requête SPARQL et retourner les résultats sous forme de tableau
def run_sparql_query(query):
    sparql = SPARQLWrapper("http://dbpedia.org/sparql")  # Endpoint DBpedia
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    try:
        # Exécution de la requête
        results = sparql.query().convert()
        
        # Vérification si des résultats existent
        if "results" in results and "bindings" in results["results"]:
            return results["results"]["bindings"]
        else:
            return None
    except Exception as e:
        return f"Erreur lors de l'exécution de la requête : {e}"

# Fonction pour afficher les résultats dans le tableau
def display_results(results):
    # Efface les anciennes colonnes et données
    tree.delete(*tree.get_children())
    tree["columns"] = ()  # Réinitialise les colonnes

    # Si aucun résultat ou une erreur, afficher un message
    if results is None or isinstance(results, str):
        tree["columns"] = ("Message",)
        tree.heading("Message", text="Message")
        tree.column("Message", width=300, anchor="center")
        tree.insert("", tk.END, values=(results if results else "Aucun résultat trouvé."))
        return

    # Obtenir les colonnes dynamiquement à partir des résultats
    if results:
        columns = list(results[0].keys())
        tree["columns"] = columns  # Définir les colonnes dynamiquement

        # Configuration des colonnes
        for col in columns:
            tree.heading(col, text=col)
            tree.column(col, width=150, anchor="center")

        # Insertion des données dans le tableau
        for result in results:
            values = [result[key]["value"] if "value" in result[key] else "" for key in columns]
            tree.insert("", tk.END, values=values)

# Fonction appelée lors du clic sur le bouton
def on_query_button_click():
    user_query = query_text.get("1.0", tk.END).strip()  # Récupérer la requête SPARQL entrée par l'utilisateur

    if user_query:  # Si une requête a été saisie
        results = run_sparql_query(user_query)
        display_results(results)
    else:
        display_results("Veuillez saisir une requête SPARQL.")

# Création de la fenêtre principale
root = tk.Tk()
root.title("Exécuter une requête SPARQL sur DBpedia")
root.geometry("800x500")  # Taille initiale de la fenêtre
root.minsize(600, 400)  # Taille minimale

# Configuration de styles pour une apparence moderne
style = ttk.Style()
style.theme_use("clam")  # Choix du thème
style.configure("Treeview", rowheight=25)

# Création du cadre pour l'interface
frame = ttk.Frame(root, padding="10")
frame.grid(row=0, column=0, sticky=(tk.N, tk.S, tk.E, tk.W))

# Configuration de la disposition flexible
root.columnconfigure(0, weight=1)
root.rowconfigure(0, weight=1)
frame.columnconfigure(1, weight=1)

# Label pour la requête SPARQL
query_label = ttk.Label(frame, text="Saisissez votre requête SPARQL:")
query_label.grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)

# Champ de saisie multilignes pour la requête SPARQL
query_text = tk.Text(frame, height=5, wrap="word", width=60)  # Limiter la largeur du champ de texte
query_text.grid(row=0, column=1, padx=5, pady=5, sticky=(tk.W, tk.E))

# Barres de défilement pour le champ texte
query_scrollbar_y = ttk.Scrollbar(frame, orient="vertical", command=query_text.yview)
query_scrollbar_y.grid(row=0, column=2, sticky=(tk.N, tk.S))
query_text.configure(yscroll=query_scrollbar_y.set)

query_scrollbar_x = ttk.Scrollbar(frame, orient="horizontal", command=query_text.xview)
query_scrollbar_x.grid(row=1, column=1, sticky=(tk.W, tk.E))
query_text.configure(xscroll=query_scrollbar_x.set)

# Bouton pour exécuter la requête
query_button = ttk.Button(frame, text="Exécuter la requête", command=on_query_button_click)
query_button.grid(row=2, column=0, columnspan=3, pady=10)

# Tableau pour afficher les résultats
tree = ttk.Treeview(frame, columns=[], show="headings", height=10)
tree.grid(row=3, column=0, columnspan=2, padx=5, pady=5, sticky=(tk.W, tk.E, tk.N, tk.S))

# Barres de défilement pour le tableau
scrollbar_y = ttk.Scrollbar(frame, orient="vertical", command=tree.yview)
scrollbar_y.grid(row=3, column=2, sticky=(tk.N, tk.S))

scrollbar_x = ttk.Scrollbar(frame, orient="horizontal", command=tree.xview)
scrollbar_x.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E))

tree.configure(yscroll=scrollbar_y.set, xscroll=scrollbar_x.set)

# Ajuster les lignes et colonnes
frame.rowconfigure(3, weight=1)

# Lancer l'application
root.mainloop()
