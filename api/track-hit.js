let memCounter = 152;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    memCounter += 1;
    return res.status(200).json({
      success: true,
      count: memCounter,
      storage: 'vercel-serverless',
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      count: 153,
    });
  }
};
