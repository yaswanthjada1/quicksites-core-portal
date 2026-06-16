import pg from 'pg';
import { MongoClient } from 'mongodb';

export class DbFactory {
    /**
     * Dispatch adaptive extraction logic for the specified database engine.
     * Returns normalized telemetry records or fallback data when discovery yields no usable source.
     */
    static async connectAndExtract(dbType, connectionUri) {
        console.log(`🔌 [DB Factory]: Initiating auto-discovery probe on variant: [${dbType}]`);

        switch (dbType.toLowerCase()) {
            case 'mongodb':
                return await this.handleDynamicMongoDB(connectionUri);
            
            case 'postgresql':
            case 'postgres':
                return await this.handleDynamicPostgreSQL(connectionUri);

            default:
                throw new Error(`Unsupported database platform engine: ${dbType}`);
        }
    }

    /**
     * Discover the most representative MongoDB collection and normalize document fields.
     */
    static async handleDynamicMongoDB(uri) {
        const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
        try {
            await client.connect();
            const db = client.db();
            
            // List available collections for the current MongoDB database
            const collections = await db.listCollections().toArray();
            if (collections.length === 0) return this.getFallbackTelemetry();

            // Select a representative collection from preferred business-oriented names, fallback to the first discovered collection
            const targetCollectionName = collections.find(c => 
                ['users', 'customers', 'accounts', 'members', 'profiles'].includes(c.name.toLowerCase())
            )?.name || collections[0].name;

            console.log(`🔍 [DB Factory]: Auto-discovered MongoDB Collection: "${targetCollectionName}"`);
            
            const collection = db.collection(targetCollectionName);
            const rawDocs = await collection.find({}).limit(100).toArray();
            if (rawDocs.length === 0) return this.getFallbackTelemetry();

            // Derive normalized active and plan field keys from the first sample document
            const sampleDoc = rawDocs[0];
            const activeFieldKey = Object.keys(sampleDoc).find(key => 
                ['active', 'isactive', 'activethismonth', 'status', 'logged_in'].includes(key.toLowerCase())
            ) || Object.keys(sampleDoc)[1];

            const planFieldKey = Object.keys(sampleDoc).find(key => 
                ['plan', 'tier', 'plantier', 'subscription', 'type'].includes(key.toLowerCase())
            );

            // Map MongoDB documents into the normalized telemetry record schema
            return rawDocs.map(doc => ({
                id: doc._id.toString(),
                activeThisMonth: doc[activeFieldKey] === true || doc[activeFieldKey] === 'active' || doc[activeFieldKey] === 1,
                plan: planFieldKey ? doc[planFieldKey] : 'Standard'
            }));
        } finally {
            await client.close();
        }
    }

    /**
     * Discover database tables and columns in PostgreSQL, then normalize the selected rows.
     */
    static async handleDynamicPostgreSQL(uri) {
        const client = new pg.Client({ connectionString: uri, connectionTimeoutMillis: 5000 });
        try {
            await client.connect();
            
            // Query public schema tables to identify available PostgreSQL data sources
            const tableDiscovery = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);

            if (tableDiscovery.rows.length === 0) return this.getFallbackTelemetry();

            // Choose a representative table from preferred names, fallback to the first discovered table
            const targetTableName = tableDiscovery.rows.find(r => 
                ['users', 'customers', 'accounts', 'members', 'profiles'].includes(r.table_name.toLowerCase())
            )?.table_name || tableDiscovery.rows[0].table_name;

            console.log(`🔍 [DB Factory]: Auto-discovered PostgreSQL Table: "${targetTableName}"`);

            // Introspect column names for the selected table to enable dynamic field mapping
            const columnDiscovery = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [targetTableName]);

            const columns = columnDiscovery.rows.map(c => c.column_name);
            
            const idKey = columns.find(c => ['id', 'uuid', 'user_id', 'uid'].includes(c.toLowerCase())) || columns[0];
            const activeKey = columns.find(c => ['active', 'is_active', 'active_this_month', 'status'].includes(c.toLowerCase()));
            const planKey = columns.find(c => ['plan', 'tier', 'plan_tier', 'subscription'].includes(c.toLowerCase()));

            // Fetch rows using dynamically mapped column labels
            const selectQuery = `SELECT ${idKey} AS id ${activeKey ? `, ${activeKey} AS active` : ''} ${planKey ? `, ${planKey} AS plan` : ''} FROM "${targetTableName}" LIMIT 100`;
            const result = await client.query(selectQuery);
            
            return result.rows.map(row => ({
                id: row.id,
                activeThisMonth: activeKey ? (row.active === true || row.active === 1 || row.active === 'active') : true,
                plan: planKey ? row.plan : 'Standard'
            }));
        } finally {
            await client.end();
        }
    }

    /**
     * Provide a minimal normalized dataset when discovery cannot produce usable records.
     */
    static getFallbackTelemetry() {
        console.log(`⚠️ [DB Factory]: Discovered target table structure is empty. Providing unified baseline telemetry stream.`);
        return [
            { id: "gen_01", activeThisMonth: true, plan: 'Premium' },
            { id: "gen_02", activeThisMonth: true, plan: 'Free' },
            { id: "gen_03", activeThisMonth: false, plan: 'Premium' }
        ];
    }
}