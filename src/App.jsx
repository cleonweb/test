import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import { Dialog } from '@headlessui/react';
import { Toaster, toast } from 'react-hot-toast';
import { validateSocialMediaUrl, extractUsername, calculateRiskFactors, generatePreviousUsernames, urlExamples } from './utils/validation';

// Generate realistic profile picture URL based on username
const getProfilePicture = (username) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4`;
};

// Platform-specific analysis functions with more realistic data
const platformAnalysis = {
  twitter: (username) => {
    const createdDate = new Date(2021, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
    const isHighRisk = Math.random() > 0.7;
    const postsPerDay = isHighRisk ? (4 + Math.random() * 10) : (1 + Math.random() * 3);
    const accountAgeDays = (new Date() - createdDate) / (1000 * 60 * 60 * 24);
    const totalPosts = Math.floor(postsPerDay * accountAgeDays);
    
    return {
      metrics: {
        tweets: totalPosts,
        followers: Math.floor(100 + Math.random() * 500),
        following: Math.floor(50 + Math.random() * 200),
        created_at: createdDate.toISOString(),
        posts_per_day: postsPerDay.toFixed(1),
        engagement_rate: (2 + Math.random() * 5).toFixed(2),
        activity_consistency: (60 + Math.random() * 30).toFixed(2),
        network_strength: (40 + Math.random() * 40).toFixed(2),
        risk_score: 0 // Will be calculated by test cases
      },
      profile: {
        hasProfilePic: Math.random() > 0.2,
        description: isHighRisk ? '' : 'Regular user description',
        location: isHighRisk ? '' : 'New York, USA',
        hasExternalUrl: !isHighRisk,
        isPrivate: isHighRisk,
        isVerified: Math.random() > 0.9,
        name: isHighRisk ? 'User123456' : username.charAt(0).toUpperCase() + username.slice(1)
      },
      activity: {
        pattern: isHighRisk ? 'Suspicious' : 'Normal',
        peak_hours: isHighRisk ? 'Automated' : 'Natural',
        suspicious_factors: []
      }
    };
  },
  instagram: (username) => {
    const createdDate = new Date(2020, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
    const isHighRisk = Math.random() > 0.7;
    const postsPerDay = isHighRisk ? (4 + Math.random() * 8) : (0.5 + Math.random() * 2);
    const accountAgeDays = (new Date() - createdDate) / (1000 * 60 * 60 * 24);
    const totalPosts = Math.floor(postsPerDay * accountAgeDays);
    
    return {
      metrics: {
        posts: totalPosts,
        stories: Math.floor(postsPerDay * 2 * accountAgeDays),
        reels: Math.floor(postsPerDay * 0.5 * accountAgeDays),
        followers: Math.floor(200 + Math.random() * 800),
        following: Math.floor(100 + Math.random() * 400),
        created_at: createdDate.toISOString(),
        posts_per_day: postsPerDay.toFixed(1),
        engagement_rate: (3 + Math.random() * 7).toFixed(2),
        activity_consistency: (50 + Math.random() * 40).toFixed(2),
        network_strength: (30 + Math.random() * 50).toFixed(2),
        risk_score: 0
      },
      profile: {
        hasProfilePic: Math.random() > 0.2,
        description: isHighRisk ? '' : 'Photography enthusiast | Travel lover',
        location: isHighRisk ? '' : 'Los Angeles, CA',
        hasExternalUrl: !isHighRisk,
        isPrivate: isHighRisk,
        isVerified: Math.random() > 0.9,
        name: isHighRisk ? 'User123456' : username.charAt(0).toUpperCase() + username.slice(1)
      },
      activity: {
        pattern: isHighRisk ? 'Suspicious' : 'Normal',
        story_frequency: isHighRisk ? 'Irregular' : 'Regular',
        suspicious_factors: []
      }
    };
  },
  facebook: (username) => {
    const createdDate = new Date(2019, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
    const isHighRisk = Math.random() > 0.7;
    const postsPerDay = isHighRisk ? (5 + Math.random() * 10) : (0.5 + Math.random() * 2);
    const accountAgeDays = (new Date() - createdDate) / (1000 * 60 * 60 * 24);
    const totalPosts = Math.floor(postsPerDay * accountAgeDays);
    
    return {
      metrics: {
        posts: totalPosts,
        friends: Math.floor(50 + Math.random() * 300),
        followers: Math.floor(20 + Math.random() * 100),
        groups: Math.floor(2 + Math.random() * 8),
        created_at: createdDate.toISOString(),
        posts_per_day: postsPerDay.toFixed(1),
        engagement_rate: (2 + Math.random() * 6).toFixed(2),
        activity_consistency: (40 + Math.random() * 50).toFixed(2),
        network_strength: (35 + Math.random() * 45).toFixed(2),
        risk_score: 0
      },
      profile: {
        hasProfilePic: Math.random() > 0.2,
        description: isHighRisk ? '' : 'Living life to the fullest',
        location: isHighRisk ? '' : 'Chicago, IL',
        hasExternalUrl: !isHighRisk,
        isPrivate: isHighRisk,
        isVerified: Math.random() > 0.9,
        name: isHighRisk ? 'User123456' : username.charAt(0).toUpperCase() + username.slice(1)
      },
      activity: {
        pattern: isHighRisk ? 'Suspicious' : 'Normal',
        group_activity: isHighRisk ? 'Inactive' : 'Active',
        suspicious_factors: []
      }
    };
  }
};

const platforms = {
  twitter: {
    name: 'Twitter (X)',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-black',
    textColor: 'text-white',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  },
  instagram: {
    name: 'Instagram',
    color: 'from-pink-500 via-purple-500 to-orange-500',
    bgColor: 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500',
    textColor: 'text-white',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },
  facebook: {
    name: 'Facebook',
    color: 'from-blue-600 to-blue-800',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  }
};

function App() {
  const [platform, setPlatform] = useState('twitter');
  const [username, setUsername] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [showUrlValidation, setShowUrlValidation] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const handlePlatformChange = (newPlatform) => {
    setPlatform(newPlatform);
    setUsername('');
    setSocialUrl('');
    setAnalysis(null);
  };

  const handleUrlChange = (url) => {
    setSocialUrl(url);
    const extractedUsername = extractUsername(url, platform);
    if (extractedUsername) {
      setUsername(extractedUsername);
    }
  };

  const checkUrl = () => {
    if (!socialUrl) {
      toast.error('Please enter a URL first');
      return;
    }

    const isValid = validateSocialMediaUrl(socialUrl, platform);
    if (isValid) {
      toast.success('Valid profile URL!', {
        icon: '✅',
        duration: 3000
      });
    } else {
      setShowUrlValidation(true);
    }
  };

  const handleAnalyze = async () => {
    if (!username.trim()) return;
    
    setIsAnimating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate analysis data
    const baseAnalysis = platformAnalysis[platform](username);
    
    // Calculate risk factors with test results
    const { riskScore, factors, testResults: results } = calculateRiskFactors({
      username,
      hasProfilePic: baseAnalysis.profile.hasProfilePic,
      description: baseAnalysis.profile.description,
      location: baseAnalysis.profile.location,
      hasExternalUrl: baseAnalysis.profile.hasExternalUrl,
      isPrivate: baseAnalysis.profile.isPrivate,
      isVerified: baseAnalysis.profile.isVerified,
      name: baseAnalysis.profile.name,
      followers: baseAnalysis.metrics.followers,
      following: baseAnalysis.metrics.following,
      posts: baseAnalysis.metrics.posts,
      created_at: baseAnalysis.metrics.created_at,
      accountAge: (new Date() - new Date(baseAnalysis.metrics.created_at)) / (1000 * 60 * 60 * 24)
    });

    // Update analysis with calculated risk factors
    const updatedAnalysis = {
      ...baseAnalysis,
      metrics: {
        ...baseAnalysis.metrics,
        risk_score: riskScore
      },
      activity: {
        ...baseAnalysis.activity,
        pattern: riskScore > 50 ? 'Suspicious' : 'Normal',
        suspicious_factors: factors
      }
    };

    setAnalysis(updatedAnalysis);
    setTestResults(results);
    setIsAnimating(false);
  };

  const getScoreColor = (value) => {
    const numValue = parseFloat(value);
    if (numValue >= 70) return 'text-red-600';
    if (numValue >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreBackground = (value) => {
    const numValue = parseFloat(value);
    if (numValue >= 70) return 'bg-red-100';
    if (numValue >= 40) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const renderProfileCard = () => {
    if (!analysis) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-4">
          <img
            src={getProfilePicture(username)}
            alt={username}
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h2 className="text-xl font-bold">@{username}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Joined {format(parseISO(analysis.metrics.created_at), 'MMMM yyyy')}</span>
              {analysis.profile.isVerified && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTestResults = () => {
    if (!testResults.length) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Security Test Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testResults.map((test, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                test.status === 'Passed' ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{test.category}</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    test.status === 'Passed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {test.status}
                </span>
              </div>
              {test.factor && (
                <p className="text-sm text-gray-600 mt-2">{test.factor}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMetrics = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-8">
        {renderProfileCard()}
        {renderTestResults()}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Account Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              {platform === 'twitter' && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Tweets</div>
                    <div className="text-xl font-bold">{analysis.metrics.tweets.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Followers</div>
                    <div className="text-xl font-bold">{analysis.metrics.followers.toLocaleString()}</div>
                  </div>
                </>
              )}
              
              {platform === 'instagram' && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Posts</div>
                    <div className="text-xl font-bold">{analysis.metrics.posts.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Stories</div>
                    <div className="text-xl font-bold">{analysis.metrics.stories.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Reels</div>
                    <div className="text-xl font-bold">{analysis.metrics.reels.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Followers</div>
                    <div className="text-xl font-bold">{analysis.metrics.followers.toLocaleString()}</div>
                  </div>
                </>
              )}
              
              {platform === 'facebook' && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Posts</div>
                    <div className="text-xl font-bold">{analysis.metrics.posts.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Friends</div>
                    <div className="text-xl font-bold">{analysis.metrics.friends.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Groups</div>
                    <div className="text-xl font-bold">{analysis.metrics.groups.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Followers</div>
                    <div className="text-xl font-bold">{analysis.metrics.followers.toLocaleString()}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Risk Score</span>
                  <span className={`font-semibold ${getScoreColor(analysis.metrics.risk_score)}`}>
                    {analysis.metrics.risk_score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      parseFloat(analysis.metrics.risk_score) >= 70 ? 'bg-red-500' :
                      parseFloat(analysis.metrics.risk_score) >= 40 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${analysis.metrics.risk_score}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Engagement Rate</span>
                  <span className={`font-semibold ${getScoreColor(analysis.metrics.engagement_rate)}`}>
                    {analysis.metrics.engagement_rate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${analysis.metrics.engagement_rate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Network Strength</span>
                  <span className={`font-semibold ${getScoreColor(analysis.metrics.network_strength)}`}>
                    {analysis.metrics.network_strength}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-purple-500"
                    style={{ width: `${analysis.metrics.network_strength}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Activity Consistency</span>
                  <span className={`font-semibold ${getScoreColor(analysis.metrics.activity_consistency)}`}>
                    {analysis.metrics.activity_consistency}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${analysis.metrics.activity_consistency}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Activity Analysis</h3>
              <button
                onClick={() => setShowActivityDetails(true)}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                View Details
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pattern</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  analysis.activity.pattern === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {analysis.activity.pattern}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {platform === 'twitter' ? 'Tweets' :
                   platform === 'instagram' ? 'Posts' :
                   'Posts'} per day
                </span>
                <span className="font-medium">{analysis.metrics.posts_per_day}</span>
              </div>

              {platform === 'instagram' && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Story Frequency</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    analysis.activity.story_frequency === 'Regular' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {analysis.activity.story_frequency}
                  </span>
                </div>
              )}

              {platform === 'facebook' && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Group Activity</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    analysis.activity.group_activity === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {analysis.activity.group_activity}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Profile Evolution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account Age</span>
                <span className="font-medium">
                  {format(parseISO(analysis.metrics.created_at), 'MMM d, yyyy')}
                </span>
              </div>

              {(platform === 'instagram' || platform === 'facebook') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Name Changes</span>
                    <span className="font-medium">{
                      platform === 'instagram' ? analysis.evolution?.username_changes :
                      analysis.evolution?.username_changes
                    }</span>
                  </div>
                  {((platform === 'instagram' && analysis.evolution?.previous_usernames?.length > 0) ||
                    (platform === 'facebook' && analysis.evolution?.previous_names?.length > 0)) &&
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="text-gray-500 mb-1">Previous names:</div>
                      <div className="space-y-1">
                        {platform === 'instagram' ?
                          analysis.evolution?.previous_usernames?.map((name, index) => (
                            <div key={index} className="text-gray-700">@{name}</div>
                          )) :
                          analysis.evolution?.previous_names?.map((name, index) => (
                            <div key={index} className="text-gray-700">{name}</div>
                          ))
                        }
                      </div>
                    </div>
                  }
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Growth Rate</span>
                <span className={`px-3    py-1 rounded-full text-sm font-medium ${
                  parseFloat(analysis.evolution?.growth_rate) > 70 ? 'bg-red-100 text-red-800' :
                  parseFloat(analysis.evolution?.growth_rate) > 40 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {analysis.evolution?.growth_rate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          onClick={() => {
            setAnalysis(null);
            setUsername('');
          }}
          className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 px-4 hover:bg-gray-200 transition-all transform flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Analyze Another Account</span>
        </motion.button>

        <Dialog
          open={showActivityDetails}
          onClose={() => setShowActivityDetails(false)}
          className="fixed inset-0 z-10 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

            <div className="relative bg-white rounded-xl max-w-lg w-full mx-auto p-6">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Activity Pattern Details
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Pattern Analysis</h4>
                  <div className={`p-3 rounded-lg ${
                    analysis.activity.pattern === 'Normal' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className={`font-medium ${
                      analysis.activity.pattern === 'Normal' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {analysis.activity.pattern} Activity Pattern
                    </div>
                    {analysis.activity.suspicious_factors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {analysis.activity.suspicious_factors.map((factor, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {factor}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Activity Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Daily Activity</div>
                      <div className="font-medium">
                        {analysis.metrics.posts_per_day} posts/day
                      </div>
                    </div>
                    {platform === 'twitter' && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">Peak Hours</div>
                        <div className="font-medium">{analysis.activity.peak_hours}</div>
                      </div>
                    )}
                    {platform === 'instagram' && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">Story Pattern</div>
                        <div className="font-medium">{analysis.activity.story_frequency}</div>
                      </div>
                    )}
                    {platform === 'facebook' && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">Group Engagement</div>
                        <div className="font-medium">{analysis.activity.group_activity}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowActivityDetails(false)}
                className="mt-6 w-full bg-gray-100 text-gray-700 rounded-lg py-2 px-4 hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  };

  const renderInputSection = () => {
    if (analysis) return null;

    return (
      <>
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter {platforms[platform].name} Profile URL (Optional)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              value={socialUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Enter ${platforms[platform].name} profile URL`}
            />
            <motion.button
              onClick={checkUrl}
              className="absolute right-2 top-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Check Link
            </motion.button>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter {platforms[platform].name} Username
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Enter ${platforms[platform].name} username`}
            />
          </div>
        </div>

        <motion.button
          onClick={handleAnalyze}
          disabled={isAnimating || !username.trim()}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium 
            ${isAnimating ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'} 
            ${platform === 'twitter' ? 'bg-black' : `bg-gradient-to-r ${platforms[platform].color}`}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isAnimating ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Analyzing...
            </div>
          ) : (
            'Analyze Account'
          )}
        </motion.button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl font-bold text-gray-900 mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            Fake Profile Authentication
          </motion.h1>
          <p className="text-gray-600">Analyze accounts across multiple platforms</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            {Object.entries(platforms).map(([key, value]) => (
              <motion.button
                key={key}
                className={`p-4 flex items-center justify-center space-x-2 ${
                  platform === key ? `${value.bgColor} ${value.textColor}` : 'hover:bg-gray-50'
                }`}
                onClick={() => handlePlatformChange(key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {value.icon}
                <span className="font-medium">{value.name}</span>
              </motion.button>
            ))}
          </div>

          <div className="p-8">
            <div className="max-w-md mx-auto">
              {renderInputSection()}

              <AnimatePresence>
                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-8"
                  >
                    {renderMetrics()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <Dialog
        open={showUrlValidation}
        onClose={() => setShowUrlValidation(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl max-w-lg w-full mx-auto p-6"
          >
            <Dialog.Title className="text-lg font-semibold mb-4 text-red-600">
              Invalid URL Format
            </Dialog.Title>

            <div className="space-y-4">
              <p className="text-gray-600">
                The URL you entered is not valid. Here are examples of valid {platforms[platform].name} profile URLs:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                {urlExamples[platform].map((example, index) => (
                  <div key={index} className="text-gray-800 font-mono mb-2">
                    {example}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowUrlValidation(false)}
              className="mt-6 w-full bg-gray-100 text-gray-700 rounded-lg py-2 px-4 hover:bg-gray-200 transition-all"
            >
              Close
            </button>
          </motion.div>
        </div>
      </Dialog>
    </div>
  );
}

export default App;