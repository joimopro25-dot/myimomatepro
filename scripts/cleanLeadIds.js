/**
 * Script: cleanLeadIds.js
 * - Usa Firebase Admin SDK para percorrer consultores/leads
 * - Se doc.data().id for falsy or diferente de doc.id, atualiza o campo id => doc.id
 *
 * Setup:
 * 1) npm i firebase-admin
 * 2) Coloque seu serviceAccountKey.json na raiz do projeto ou configure GOOGLE_APPLICATION_CREDENTIALS
 * 3) node scripts/cleanLeadIds.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Carregar credenciais (ajuste se usar GOOGLE_APPLICATION_CREDENTIALS)
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
try {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath))
    });
} catch (e) {
    // fallback para ADC se já configurado
    admin.initializeApp();
}

const db = admin.firestore();

async function cleanLeadIds() {
    const consultoresSnapshot = await db.collection('consultores').get();
    let totalUpdated = 0;

    for (const consulDoc of consultoresSnapshot.docs) {
        const consultorId = consulDoc.id;
        const leadsRef = db.collection('consultores').doc(consultorId).collection('leads');
        const leadsSnap = await leadsRef.get();

        for (const leadDoc of leadsSnap.docs) {
            const data = leadDoc.data();
            const docId = leadDoc.id;

            const needsUpdate =
                !data.id || (typeof data.id === 'string' && data.id.trim() === '') || data.id !== docId;

            if (needsUpdate) {
                // Atualiza apenas o campo id (merge)
                await leadDoc.ref.set({ id: docId }, { merge: true });
                totalUpdated++;
                console.log(`Atualizado lead: consultor=${consultorId} lead=${docId}`);
            }
        }
    }

    console.log(`Concluído. Documentos atualizados: ${totalUpdated}`);
}

cleanLeadIds()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Erro ao limpar ids:', err);
        process.exit(1);
    });