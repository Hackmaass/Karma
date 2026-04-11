import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- OAuth Routes ---

  // 1. Slack
  app.get('/api/auth/slack/url', (req, res) => {
    const redirectUri = req.query.redirectUri as string;
    const clientId = process.env.SLACK_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: 'SLACK_CLIENT_ID not configured' });
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'channels:history,chat:write,users:read',
    });
    res.json({ url: `https://slack.com/oauth/v2/authorize?${params.toString()}` });
  });

  app.get(['/api/auth/slack/callback', '/api/auth/slack/callback/'], async (req, res) => {
    const { code, redirectUri } = req.query;
    try {
      // In a real app, you would exchange the code for a token here using fetch
      // const response = await fetch('https://slack.com/api/oauth.v2.access', { ... });
      // const data = await response.json();
      // Store data.access_token in your database associated with the user
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'slack' }, '*');
                window.close();
              } else {
                window.location.href = '/app/settings';
              }
            </script>
            <p>Slack authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).send('Authentication failed');
    }
  });

  // 2. Discord
  app.get('/api/auth/discord/url', (req, res) => {
    const redirectUri = req.query.redirectUri as string;
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: 'DISCORD_CLIENT_ID not configured' });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify messages.read',
    });
    res.json({ url: `https://discord.com/api/oauth2/authorize?${params.toString()}` });
  });

  app.get(['/api/auth/discord/callback', '/api/auth/discord/callback/'], async (req, res) => {
    const { code, redirectUri } = req.query;
    try {
      // Exchange code for token
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'discord' }, '*');
                window.close();
              } else {
                window.location.href = '/app/settings';
              }
            </script>
            <p>Discord authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).send('Authentication failed');
    }
  });

  // 3. Microsoft Teams
  app.get('/api/auth/teams/url', (req, res) => {
    const redirectUri = req.query.redirectUri as string;
    const clientId = process.env.TEAMS_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: 'TEAMS_CLIENT_ID not configured' });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      response_mode: 'query',
      scope: 'offline_access user.read ChannelMessage.Read.All',
    });
    res.json({ url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}` });
  });

  app.get(['/api/auth/teams/callback', '/api/auth/teams/callback/'], async (req, res) => {
    const { code, redirectUri } = req.query;
    try {
      // Exchange code for token
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'teams' }, '*');
                window.close();
              } else {
                window.location.href = '/app/settings';
              }
            </script>
            <p>Microsoft Teams authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).send('Authentication failed');
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
