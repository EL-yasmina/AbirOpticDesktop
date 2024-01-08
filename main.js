const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path');
const { db_modifierStatutCommande, db_getCommandes, db_getProduits, db_deleteProduit, db_ajouterProduit, db_modifierProduit,db_getProduitById   } = require('./database'); // Chemin vers votre fichier database.js

function chanrgementData(fenetre, selectPageProduit) {
  db_getCommandes((results) => fenetre.webContents.send('afficher-commandes', results));
  db_getProduits((results) => fenetre.webContents.send('afficher-produits', results, selectPageProduit));
}


function createWindow() {
  const fenetre = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  });

  fenetre.loadFile('index.html');
  fenetre.webContents.openDevTools();
  fenetre.webContents.on('did-finish-load', () => {
    chanrgementData(fenetre);
    fenetre.webContents.send('event-formulaire-produit');
  });


  ipcMain.on('delete-produit', (event, produitId) => {
    db_deleteProduit(produitId, () => chanrgementData(fenetre, false));
  });
  ipcMain.on('ajouter-produit', (event, produit) => {
    db_ajouterProduit(produit, () => chanrgementData(fenetre, true));
  });
  ipcMain.on('modifier-produit', (event, produit) => {
    console.log('modifier-produit', produit)
    db_modifierProduit(produit, () => chanrgementData(fenetre, true));
  });  
  ipcMain.on('ouvrir-produit', (event, idProduit) => {
    db_getProduitById(idProduit, (produit) => event.sender.send('charger-produit', produit));
  });
  ipcMain.on('modifier-statut-commande', (event, idCommande, statut) => {
    db_modifierStatutCommande(idCommande, statut, () => chanrgementData(fenetre, false));
  });  

}


// parametrage fenetre
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

