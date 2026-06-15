import express from 'express';
import { DbFactory } from '../config/dbFactory.js';
import { CompanyPredictor } from '../ml/companyPredictor.js';
import { MongoClient } from 'mongodb'; // Needed for deep collection layout inspection

const router = express.Router();
let currentConnectedClient = null;

// --- EXISTING HANDSHAKE ROUTE ---
router.post('/connect', async (req, res) => {
    try {
        const { companyName, businessType, databaseType, databaseUri, industryContext } = req.body;

        if (!companyName || !databaseUri || !databaseType) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing core initialization markers: Database Type, URI, or Company Name." 
            });
        }

        const normalizedDataset = await DbFactory.connectAndExtract(databaseType, databaseUri);
        const computedMetrics = CompanyPredictor.analyzeBusinessMetrics(normalizedDataset);

        currentConnectedClient = {
            companyName,
            businessType,
            industryContext,
            databaseType: `${databaseType.toUpperCase()} Engine`,
            databaseUri, // Kept in memory so subsequent explorer requests can re-use the connection coordinates
            verifiedAt: new Date().toISOString()
        };

        return res.status(200).json({
            success: true,
            message: `Synchronization verified across local ${databaseType} architecture.`,
            clientProfile: currentConnectedClient,
            initialTelemetry: computedMetrics
        });

    } catch (error) {
        console.error("❌ [Ecosystem Gateway Rejection]:", error.message);
        return res.status(500).json({
            success: false,
            message: "Database handshake timeout or parameter mismatch.",
            error: error.message
        });
    }
});

// --- NEW GATEWAY: DISCOVER ALL TARGET DATABASE COLLECTIONS ---
router.post('/collections', async (req, res) => {
    const { databaseType, databaseUri } = req.body;
    console.log(`🔍 [DB Inspector]: Fetching schema structural blueprint via dynamic factory...`);
    
    if (!databaseUri) {
        return res.status(400).json({ success: false, message: 'Missing target database URI coordinates.' });
    }

    try {
        if (databaseType.toLowerCase().includes('mongo')) {
            const client = new MongoClient(databaseUri, { serverSelectionTimeoutMS: 5000 });
            await client.connect();
            const db = client.db();
            
            const collections = await db.listCollections().toArray();
            await client.close();
            
            // 🛡️ SYSTEM SYSTEM FILTER: Safely intercept metadata and layout parameter frames
            const userCollections = collections.filter(
                c => c.name !== 'qss_pinboard_metadata' && !c.name.startsWith('system.')
            );
            
            return res.status(200).json({ 
                success: true, 
                collections: userCollections.map(c => c.name) 
            });
        }
        
        // Relational fallback placeholders
        return res.status(200).json({ success: true, collections: ['users', 'logs_system', 'metrics_cache'] });
    } catch (error) {
        console.error("❌ [DB Inspector Error]:", error.message);
        return res.status(500).json({ success: false, message: 'Structural schema lookup failed.', error: error.message });
    }
});

// --- NEW GATEWAY: BROWSE RAW INTERNAL FIELDS (FIRST 50 ENTRIES) ---
router.post('/browse', async (req, res) => {
    const { databaseType, databaseUri, targetCollection } = req.body;
    console.log(`🗂️ [DB Inspector]: Streaming content matrix for collection: "${targetCollection}"`);

    if (!databaseUri || !targetCollection) {
        return res.status(400).json({ success: false, message: 'Missing target workspace parameter identifiers.' });
    }

    // Defensive gate check: block front-end requests targeting structural metadata tables directly
    if (targetCollection === 'qss_pinboard_metadata' || targetCollection.startsWith('system.')) {
        return res.status(403).json({ success: false, message: 'Access to system layout configurations is restricted.' });
    }

    try {
        if (databaseType.toLowerCase().includes('mongo')) {
            const client = new MongoClient(databaseUri, { serverSelectionTimeoutMS: 5000 });
            await client.connect();
            const db = client.db();
            
            const rawDocuments = await db.collection(targetCollection).find({}).limit(50).toArray();
            await client.close();
            
            return res.status(200).json({ success: true, rows: rawDocuments });
        }
        return res.status(200).json({ success: true, rows: [] });
    } catch (error) {
        console.error("❌ [DB Explorer Error]:", error.message);
        return res.status(500).json({ success: false, message: 'Failed fetching row datasets.', error: error.message });
    }
});

export default router;