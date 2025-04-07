const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Elasticsearch client (update with your credentials)
const esClient = new Client({
  node: 'http://localhost:9200', // or Elastic Cloud URL
  // auth: { apiKey: 'your-api-key' } // Uncomment for Elastic Cloud
});

// Sync Firestore tickets to Elasticsearch on write
exports.syncTicketsToElasticsearch = functions.firestore
  .document('tickets/{ticketId}')
  .onWrite(async (change, context) => {
    const ticketId = context.params.ticketId;
    const data = change.after.exists ? change.after.data() : null;

    if (!data) {
      // Ticket deleted
      await esClient.delete({
        index: 'tickets',
        id: ticketId,
      }).catch(err => console.log('Delete error:', err));
      return null;
    }

    // Ticket added or updated
    const ticket = {
      id: ticketId,
      title: data.title,
      description: data.description,
      status: data.status,
      createdAt: data.createdAt.toDate().toISOString(),
      userId: data.userId,
      imageUrls: data.imageUrls || [],
    };

    await esClient.index({
      index: 'tickets',
      id: ticketId,
      body: ticket,
    }).catch(err => console.error('Index error:', err));

    return null;
  });

// Search endpoint
exports.searchTickets = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { q, userId } = req.query;

    if (!q || !userId) {
      return res.status(400).json({ error: 'Query and userId are required' });
    }

    try {
      const result = await esClient.search({
        index: 'tickets',
        body: {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query: q,
                    fields: ['title', 'description'],
                    fuzziness: 'AUTO',
                  },
                },
                { match: { userId } },
              ],
            },
          },
        },
      });

      const tickets = result.hits.hits.map(hit => ({
        id: hit._id,
        ...hit._source,
      }));
      res.json(tickets);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });
});

// Initial sync (run manually once via a callable function)
exports.initialSyncToElasticsearch = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const ticketsRef = admin.firestore().collection('tickets');
  const snapshot = await ticketsRef.get();

  const bulkOps = [];
  snapshot.forEach(doc => {
    const ticket = { id: doc.id, ...doc.data() };
    bulkOps.push({ index: { _index: 'tickets', _id: ticket.id } });
    bulkOps.push({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      createdAt: ticket.createdAt.toDate().toISOString(),
      userId: ticket.userId,
      imageUrls: ticket.imageUrls || [],
    });
  });

  if (bulkOps.length > 0) {
    await esClient.bulk({ body: bulkOps });
    return { message: 'Initial sync completed' };
  }
  return { message: 'No tickets to sync' };
});