// Install necessary packages: npm install express spellchecker natural
const express = require('express');
const spellchecker = require('spellchecker');
const natural = require('natural');
const app = express();
const port = 3000;

// Middleware to parse JSON input
app.use(express.json());

// Define keywords for each category
const categories = {
  upper: [
    'jacket', 'blazer', 'shirt', 'blouse', 'sweatshirt', 'tank', 'hoodie', 'coat',
    'sweater', 'cardigan', 'tunic', 'top', 'vest', 'jumper', 'turtleneck', 'bralette'
  ],
  lower: [
    'pant', 'jean', 'short', 'skirt', 'legging', 'chino', 'culotte',
    'cargo', 'palazzo', 'capri', 'trunk', 'brief', 'boxer', 'loungewear'
  ],
  overall: [
    'dress', 'tracksuit', 'gown', 'robe', 'saree', 'kurtas', 'uniform',
    'swim', 'pajama', 'nightgown', 'onesie', 'thermal', 'kimono', 'sarong', 'wrap'
  ]
};

// Function to sanitize input and handle misspellings
function sanitizeInput(input) {
  const sanitized = input
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // Remove special characters
    .split(' ')
    .map(word => (spellchecker.isMisspelled(word) ? spellchecker.getCorrectionsForMisspelling(word)[0] || word : word)) // Correct spelling
    .join(' ');
  return sanitized;
}

// Function to find the closest match using Levenshtein distance
function findClosestMatch(sanitizedTag) {
  let closestCategory = null;
  let closestDistance = Infinity;

  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      const distance = natural.LevenshteinDistance(sanitizedTag, keyword);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestCategory = category;
      }
    }
  }

  return closestCategory;
}

// Function to classify meta tag
function classifyMetaTag(metaTag) {
  const sanitizedTag = sanitizeInput(metaTag);

  // Check for an exact match in categories
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i'); // Match whole words
      if (regex.test(sanitizedTag)) {
        return category;
      }
    }
  }

  // If no exact match is found, find the closest match
  return findClosestMatch(sanitizedTag);
}

// Define the route to classify meta tags
app.post('/classify', (req, res) => {
  const { metaTags } = req.body;

  if (!metaTags || !Array.isArray(metaTags)) {
    return res.status(400).json({ error: 'Invalid input. Please provide an array of meta tags.' });
  }

  const results = metaTags.map(tag => ({
    metaTag: tag,
    category: classifyMetaTag(tag)
  }));

  res.json({ results });
});

// Start the server
app.listen(port, () => {
  console.log(`Meta tag classifier running on http://localhost:${port}`);
});
