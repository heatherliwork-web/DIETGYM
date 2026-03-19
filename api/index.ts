export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    success: true,
    message: 'DIETGYM API is running',
    version: '2.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      gemini: '/api/gemini'
    }
  });
}