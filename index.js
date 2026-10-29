// Appwrite Function: "visit-total"
// Counts the rows in the "visits" table and returns ONLY the number.
// The table itself stays private; visitors never read the rows.
import { Client, TablesDB, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(req.headers['x-appwrite-key']);

    const tablesDB = new TablesDB(client);
    const result = await tablesDB.listRows({
      databaseId: '6aafc5ce0007461d09d3',
      tableId: 'visits',
      queries: [Query.limit(1)],
    });

    return res.json({ total: result.total });
  } catch (err) {
    error('visit-total failed: ' + err.message);
    return res.json({ total: null }, 500);
  }
};
