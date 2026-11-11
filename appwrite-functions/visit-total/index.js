import { Client, TablesDB } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(req.headers['x-appwrite-key']);

    const tablesDB = new TablesDB(client);

    // Increase the counter by 1 (uses only 1 document)
    const doc = await tablesDB.incrementRowColumn({
      databaseId: '6aafc5ce0007461d09d3',
      tableId: 'stats',
      rowId: 'total',
      column: 'count',
      value: 1
    });

    return res.json({ total: doc.count });
  } catch (err) {
    error('visit-total failed: ' + err.message);
    return res.json({ total: null }, 500);
  }
};
