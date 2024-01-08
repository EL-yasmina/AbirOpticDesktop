const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

// La Configurations de la base de données
const dbConfig = {
    host: 'sql11.freesqldatabase.com',
    user: 'sql11667198',
    password: 'cdSPCALtRD',
    database: 'sql11667198'
};
//mysqli_connect("sql11.freesqldatabase.com","sql11667198","cdSPCALtRD","sql11667198");
// Création de la connexion à la base de données
const connection = mysql.createConnection(dbConfig);

// pour Connexion à la base de données
connection.connect((err) => {

    console.log("4");
    if (err) {
        console.error('Erreur de connexion à la base de données : ', err);
    } else {
        console.log('Connecté à la base de données MySQL');
    }
});

// ici la Fonction pour récupérer les commandes depuis la base de données
function db_getCommandes(callback) {
    const query =
        'SELECT commande.id, commande.date, commande.quantite, commande.statut, produit.nom AS nomProduit, client.nom AS nomClient ' +
        'FROM commande ' +
        'INNER JOIN client ON client.id = commande.id_client ' +
        'INNER JOIN produit ON produit.id = commande.id_produit order by commande.id DESC';

    connection.query(query, (err, results) => callback(results));
}

function db_getProduits(callback) {
    const query = 'SELECT * FROM produit order by id DESC';
    connection.query(query, (err,results) => callback(results));
}

function db_deleteProduit(produitId, callback) {
    const deleteCommandesQuery = 'DELETE FROM commande WHERE id_produit = ?';
    connection.query(deleteCommandesQuery, [produitId], (err, results) => {
        const db_deleteProduitQuery = 'DELETE FROM produit WHERE id = ?';
        connection.query(db_deleteProduitQuery, [produitId], () => callback());        
    });
}



function db_ajouterProduit(produit, callback) {
    const query =
        'INSERT INTO produit (nom, quantite, image, solde, prix, description) ' +
        'VALUES (\'' + produit.nom + '\', ' + produit.quantite + ', ' + produit.image + ', ' + produit.solde + ', ' + produit.prix + ', \'' + produit.description + '\');';
    
    connection.query(query, () => callback());
    produit.image = null;
}

function db_modifierProduit(produit, callback) {
    console.log('db_modifierProduit', produit)
    let image = "";
    if(produit.image != null){
        image = 'image = ' + produit.image + ', ';
    }
    const query =
        'UPDATE produit SET ' +
        'nom = \'' + produit.nom + '\', ' +
        'quantite = ' + produit.quantite + ', ' +
        image +
        'solde = ' + produit.solde + ', ' +
        'prix = ' + produit.prix + ', ' +
        'description = \'' + produit.description + '\' ' +
        'WHERE id = ' + produit.id;

        console.log('db_modifierProduit', query)
    connection.query(query, () => callback());
    produit.image = null;
}

function db_modifierStatutCommande(idCommande, statut, callback) {
    const query = 'UPDATE commande SET statut = ? WHERE id = ?';
    connection.query(query, [statut, idCommande], () => callback());
}

function db_getProduitById(produitId, callback) {
    const query = 'SELECT * FROM produit WHERE id = ?';
    connection.query(query, [produitId], (err, results) => callback(results[0]));
}
module.exports = {
    db_modifierStatutCommande, db_getCommandes, db_getProduits, db_deleteProduit, db_ajouterProduit, db_modifierProduit,db_getProduitById
};