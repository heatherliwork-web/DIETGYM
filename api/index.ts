export default async function handler(req: any, res: any) {
  res.status(200).json({
    success: true,
    message: 'DIETGYM API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      gemini: '/api/gemini'
    }
  });
}