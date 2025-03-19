const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Import your fulfillment logic
const fulfillmentLogic = require('./index');

app.post('/webhook', (request, response) => {
  const agent = new WebhookClient({ request, response });
  return fulfillmentLogic.handleWebhook(agent);
});

// Simple health check endpoint
app.get('/', (req, res) => {
  res.send('Book Recommendation Chatbot Fulfillment is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
