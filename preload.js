
const { ipcRenderer } = require('electron');
const fs = require('fs');


// des ecouteurs

ipcRenderer.on('afficher-commandes', (event, commandes) => {
  console.log("chargement commandes...")
  const commandesContainer = document.getElementById('liste-commandes');
  if (commandesContainer != null && commandes != null) {

    const tableHTML = `
    
      <table class="table table-striped table-sm">
        <thead style ="background: red; color: white;">
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Client</th>
            <th>Produit</th>
            <th>Quantite</th>
            <th>Statut</th>
            <th>Actions</th>
            <!-- Ajoutez d'autres en-têtes de colonne selon votre schéma de base de données -->
          </tr>
        </thead>
        <tbody>
          ${commandes.map(commande => {
              let tdStatut = "";
              if (commande.statut == 0)
                tdStatut = "<text class='text-secondary'><b>En traitement</b></text>"
              else if (commande.statut == 1)
                tdStatut = "<text class='text-success'><b>Envoyé</b></text>"
              else if (commande.statut == 2)
                tdStatut = "<text class='text-info'><b>Reçu</b></text>"
              else if (commande.statut == 3)
                tdStatut = "<text class='text-danger'><b>Annuler</b></text>"
              else tdStatut = "NONE"
              return `
              <tr>
                <td>${commande.id}</td>
                <td>${commande.date.toLocaleDateString('fr-FR')}</td>
                <td>${commande.nomClient}</td>
                <td>${commande.nomProduit}</td>
                <td>${commande.quantite}</td>
                <td>${tdStatut}</td>
                <td>
                <button type="button" class="modifier-statut-button btn btn-secondary" id="${commande.id}" name="0">Traitement</button>
                <button type="button" class="modifier-statut-button btn btn-success" id="${commande.id}" name="1">Envoyé</button>
                <button type="button" class="modifier-statut-button btn btn-info" id="${commande.id}" name="2">Reçu</button>
                <button type="button" class="modifier-statut-button btn btn-danger" id="${commande.id}" name="3">Annuler</button>
                </td>
              </tr>`
    }).join('')}
        </tbody>
      </table>
    `;


    commandesContainer.innerHTML = tableHTML;
    console.log("chargement commandes fin")
    const modfierStatutButtons = document.querySelectorAll('.modifier-statut-button');

    modfierStatutButtons.forEach(button => {
      button.addEventListener('click', () => {
        const idProduit = button.id;
        const statut = button.name;
        ipcRenderer.send('modifier-statut-commande', idProduit, statut);
      });
    });
    const actualiserButton = document.getElementById('actualiser');
    actualiserButton.addEventListener('click', () => {
      ipcRenderer.send('actualiser',null);
    });

  }
});

ipcRenderer.on('afficher-produits', (event, produits, selectPageProduit) => {
  console.log("chargement produit...")
  const produitsContainer = document.getElementById('liste-produits');
  if (produitsContainer != null && produits != null) {

    const tableHTML = `
             
      <table class="table table-striped table-sm
      
      ">
        <thead>
          <tr>
            <th>ID</th>
            <th>nom</th>
            <th>prix</th>
            <th>description</th>
            <th>quantite</th>
            <th>solde</th>
            <th>Actions</th>
            <!-- Ajoutez d'autres en-têtes de colonne selon votre schéma de base de données -->
          </tr>
        </thead>
        <tbody>
          ${produits.map(produit => `
            <tr>
              <td>${produit.id}</td>
              <td>${produit.nom}</td>
              <td>${produit.prix}</td>
              <td>${produit.description}</td>
              <td>${produit.quantite}</td>
              <td>${produit.solde}</td>
              <td><button class="modifier-produit-button btn btn-success" id="${produit.id}">Modifier</button>
              <button class="delete-produit-button btn btn-danger" id="${produit.id}">Supprimer</button></td>
              
              <!-- Ajoutez d'autres cellules de données selon votre schéma de base de données -->
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    //ICI J'AI Remplacez le contenu de la div avec le tableau HTML généré
    produitsContainer.innerHTML = tableHTML;

    const deleteButtons = document.querySelectorAll('.delete-produit-button');
    const modifierButtons = document.querySelectorAll('.modifier-produit-button');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const idProduit = button.id;
        ipcRenderer.send('delete-produit', idProduit);
      });
    });

    modifierButtons.forEach(button => {
      button.addEventListener('click', () => {
        const idProduit = button.id;
        const ongletProduits = document.getElementById('pills-modifier-produit-tab');
        ongletProduits.click();
        ipcRenderer.send('ouvrir-produit', idProduit);
      });
    });
    if (selectPageProduit == true) {
      const ongletProduits = document.getElementById('pills-produits-tab');
      ongletProduits.click();
    }
    console.log("chargement produit fin")
  }
});

ipcRenderer.on('event-formulaire-produit', (event, obj) => {
  const ajouterProduitButton = document.getElementById('ajouterProduit');
  let selectedImage = null;

  ajouterProduitButton.addEventListener('click', () => {
    let produit = {
      id: document.getElementById('idProduit').value,
      nom: document.getElementById('nomProduit').value,
      quantite: document.getElementById('quantiteProduit').value,
      image: selectedImage,
      solde: document.getElementById('soldeProduit').value,
      prix: document.getElementById('prixProduit').value,
      description: document.getElementById('descriptionProduit').value,
    }
    ipcRenderer.send('ajouter-produit', produit);
  })

  document.getElementById('imageProduit').addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
      selectedImage = '0x' + fs.readFileSync(file.path).toString('hex');//hexadicimal
    }
  });


  const modifierProduitButton = document.getElementById('modifierProduit');
  modifierProduitButton.addEventListener('click', () => {
    console.log('click')
    let produit = {
      id: document.getElementById('m_idProduit').value,
      nom: document.getElementById('m_nomProduit').value,
      quantite: document.getElementById('m_quantiteProduit').value,
      image: selectedImage,
      solde: document.getElementById('m_soldeProduit').value,
      prix: document.getElementById('m_prixProduit').value,
      description: document.getElementById('m_descriptionProduit').value,
    }
    console.log('click', produit)
    ipcRenderer.send('modifier-produit', produit);
  })


  document.getElementById('m_imageProduit').addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
      selectedImage = '0x' + fs.readFileSync(file.path).toString('hex');//hexadicimal
    }
  });


});


ipcRenderer.on('charger-produit', (event, produit) => {
  document.getElementById('m_idProduit').value = produit.id;
  document.getElementById('m_nomProduit').value = produit.nom;
  document.getElementById('m_quantiteProduit').value = produit.quantite;
  document.getElementById('m_soldeProduit').value = produit.solde;
  document.getElementById('m_prixProduit').value = produit.prix;
  document.getElementById('m_descriptionProduit').value = produit.description;
});
