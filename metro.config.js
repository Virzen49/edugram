const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add asset extensions for PDFs and HTML files
defaultConfig.resolver.assetExts.push('pdf', 'html', 'htm', 'ppt', 'pptx', 'doc', 'docx');

// Add platform extensions
defaultConfig.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = defaultConfig;