// Social media URL validation patterns
export const urlPatterns = {
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,15}\/?$/,
  instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]{1,30}\/?$/,
  facebook: /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]{1,50}\/?$/
};

export const urlExamples = {
  twitter: ['https://twitter.com/username', 'https://x.com/username'],
  instagram: ['https://instagram.com/username'],
  facebook: ['https://facebook.com/username']
};

// Extract username from social media URL
export const extractUsername = (url, platform) => {
  if (!url) return '';
  
  const username = url.split('/').filter(Boolean).pop();
  return username?.replace('@', '') || '';
};

// Validate social media URL
export const validateSocialMediaUrl = (url, platform) => {
  if (!url) return false;
  return urlPatterns[platform].test(url);
};

// Test Case 1: Profile Picture Check
const checkProfilePicture = (hasProfilePic) => {
  if (!hasProfilePic) {
    return {
      score: 20,
      factor: 'No profile picture',
      category: 'Profile Picture'
    };
  }
  return { score: 0, category: 'Profile Picture', status: 'Valid' };
};

// Test Case 2: Username Analysis
const analyzeUsername = (username) => {
  const numericRatio = (username.match(/\d/g) || []).length / username.length;
  if (numericRatio > 0.3) {
    return {
      score: 15,
      factor: 'High number of numeric characters in username',
      category: 'Username'
    };
  }
  return { score: 0, category: 'Username', status: 'Valid' };
};

// Test Case 3: Description Length
const checkDescription = (description) => {
  if (!description || description.length < 10) {
    return {
      score: 10,
      factor: 'Very short or no profile description',
      category: 'Bio'
    };
  }
  return { score: 0, category: 'Bio', status: 'Valid' };
};

// Test Case 4: Follower/Following Ratio
const checkFollowerRatio = (followers, following) => {
  const followRatio = followers / (following || 1);
  if (followRatio < 0.01 || followRatio > 100) {
    return {
      score: 15,
      factor: 'Suspicious follower/following ratio',
      category: 'Network'
    };
  }
  return { score: 0, category: 'Network', status: 'Valid' };
};

// Test Case 5: Account Age
const checkAccountAge = (createdAt) => {
  const accountAge = (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
  if (accountAge < 30) {
    return {
      score: 20,
      factor: 'Recently created account',
      category: 'Account Age'
    };
  }
  return { score: 0, category: 'Account Age', status: 'Valid' };
};

// Test Case 6: Post Frequency
const checkPostFrequency = (posts, accountAge) => {
  const postsPerDay = posts / (accountAge || 1);
  if (postsPerDay > 4) {
    return {
      score: 20,
      factor: 'Unusually high posting frequency',
      category: 'Activity'
    };
  }
  return { score: 0, category: 'Activity', status: 'Valid' };
};

// Test Case 7: Location Check
const checkLocation = (location) => {
  if (!location) {
    return {
      score: 5,
      factor: 'No location information',
      category: 'Location'
    };
  }
  return { score: 0, category: 'Location', status: 'Valid' };
};

// Test Case 8: External URL Check
const checkExternalUrl = (hasExternalUrl) => {
  if (!hasExternalUrl) {
    return {
      score: 5,
      factor: 'No external URL in profile',
      category: 'External Links'
    };
  }
  return { score: 0, category: 'External Links', status: 'Valid' };
};

// Test Case 9: Profile Privacy
const checkPrivacy = (isPrivate) => {
  if (isPrivate) {
    return {
      score: 10,
      factor: 'Private account',
      category: 'Privacy'
    };
  }
  return { score: 0, category: 'Privacy', status: 'Valid' };
};

// Test Case 10: Name-Username Similarity
const checkNameUsernameSimilarity = (name, username) => {
  const similarity = name.toLowerCase().includes(username.toLowerCase()) ||
                    username.toLowerCase().includes(name.toLowerCase());
  if (!similarity) {
    return {
      score: 10,
      factor: 'Name does not match username pattern',
      category: 'Identity'
    };
  }
  return { score: 0, category: 'Identity', status: 'Valid' };
};

// Test Case 11: Bio Keywords
const checkBioKeywords = (bio) => {
  const suspiciousKeywords = ['follow back', 'follow 4 follow', 'f4f', 'l4l', 'like for like'];
  const hasSuspiciousKeywords = suspiciousKeywords.some(keyword => 
    bio.toLowerCase().includes(keyword)
  );
  
  if (hasSuspiciousKeywords) {
    return {
      score: 15,
      factor: 'Suspicious keywords in bio',
      category: 'Bio Content'
    };
  }
  return { score: 0, category: 'Bio Content', status: 'Valid' };
};

// Test Case 12: Account Verification
const checkVerification = (isVerified) => {
  if (!isVerified) {
    return {
      score: 5,
      factor: 'Unverified account',
      category: 'Verification'
    };
  }
  return { score: 0, category: 'Verification', status: 'Valid' };
};

// Calculate risk factors based on profile data
export const calculateRiskFactors = (profileData) => {
  const checks = [
    checkProfilePicture(profileData.hasProfilePic),
    analyzeUsername(profileData.username),
    checkDescription(profileData.description),
    checkFollowerRatio(profileData.followers, profileData.following),
    checkAccountAge(profileData.created_at),
    checkPostFrequency(profileData.posts, profileData.accountAge),
    checkLocation(profileData.location),
    checkExternalUrl(profileData.hasExternalUrl),
    checkPrivacy(profileData.isPrivate),
    checkNameUsernameSimilarity(profileData.name || '', profileData.username),
    checkBioKeywords(profileData.description || ''),
    checkVerification(profileData.isVerified)
  ];

  const factors = checks
    .filter(check => check.factor)
    .map(check => check.factor);

  const totalRiskScore = checks.reduce((sum, check) => sum + check.score, 0);

  return {
    riskScore: Math.min(100, totalRiskScore),
    factors,
    testResults: checks.map(check => ({
      category: check.category,
      status: check.factor ? 'Failed' : 'Passed',
      factor: check.factor || null
    }))
  };
};

// Generate realistic previous usernames
export const generatePreviousUsernames = (currentUsername) => {
  const suffixes = ['_real', '_official', '.original', '_backup', '_private'];
  const prefixes = ['real.', 'official.', 'the.', 'im.', 'its.'];
  
  return [
    `${prefixes[Math.floor(Math.random() * prefixes.length)]}${currentUsername}`,
    `${currentUsername}${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
    `${currentUsername}_${Math.floor(Math.random() * 1000)}`,
  ].slice(0, Math.floor(Math.random() * 3) + 1);
};