import 'dotenv/config';

import express from 'express';
import cors from 'cors';
// import { PodcastAgent } from './services/agent/podcastAgent';
import { Agent } from './services/agent/agent';

const app = express();

const corsOptions = {
  origin: ['http://localhost:3000'],  
  credentials: true,
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));


app.use(express.json());

// 4. Your agent endpoint
app.post('/agent/run', async (req, res) => {
  try {
    const { objective } = req.body;
    if (!objective) {
      return res.status(400).json({ error: 'Objective is required' });
    }
    console.log('Received objective:', objective);
    const agent = new Agent();
    const result = await agent.run(objective);
    res.json({ result });
  } catch (error) {
    console.error('Error running agent:', error);
    res.status(500).json({ error: 'Failed to run agent' });
  }
});

const PORT = 3002;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
