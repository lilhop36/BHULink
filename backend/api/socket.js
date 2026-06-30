// Serverless-compatible socket alternative using Server-Sent Events
let connections = new Map();

export default function handler(req, res) {
  if (req.method === 'GET') {
    // SSE endpoint for real-time updates
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const clientId = Date.now() + '-' + Math.random();
    connections.set(clientId, res);

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

    // Handle client disconnect
    req.on('close', () => {
      connections.delete(clientId);
    });

  } else if (req.method === 'POST') {
    // Broadcast message to all connected clients
    const { message, type, room } = req.body;
    
    connections.forEach((client, clientId) => {
      try {
        client.write(`data: ${JSON.stringify({ type, message, room, timestamp: Date.now() })}\n\n`);
      } catch (error) {
        // Remove dead connections
        connections.delete(clientId);
      }
    });

    res.status(200).json({ success: true, connections: connections.size });
  }
}
