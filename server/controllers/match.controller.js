import axios from 'axios';
import Job from '../models/Job.js';

// Common stop words to filter out during analysis
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
  'is', 'it', 'its', 'itself', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
  'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

// Dictionary of technical skills to prioritize
const TECH_SKILLS = new Set([
  'react', 'node', 'express', 'mongodb', 'redux', 'zustand', 'javascript', 'typescript', 'python', 'java', 'c++',
  'aws', 'docker', 'kubernetes', 'terraform', 'git', 'sql', 'postgresql', 'mysql', 'html', 'css', 'tailwind',
  'nextjs', 'next.js', 'vue', 'angular', 'rest', 'graphql', 'api', 'devops', 'cicd', 'ci/cd', 'linux', 'bash',
  'machine', 'learning', 'deep', 'ai', 'nlp', 'pytorch', 'tensorflow', 'pandas', 'numpy', 'scikit-learn', 'data',
  'science', 'analytics', 'hadoop', 'spark', 'cloud', 'security', 'django', 'flask', 'fastapi', 'testing', 'jest'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s\-\.]/g, ' ') // replace punctuation with spaces
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

export const analyzeMatch = async (req, res, next) => {
  try {
    const { resumeText, jobDescription, jobId } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: 'Resume text is required' });
    }

    let description = jobDescription || '';

    // If jobId is provided, retrieve job details to get description
    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        description = `${job.title} ${job.company} ${job.description} ${job.requirements.join(' ')} ${job.tags.join(' ')}`;
      }
    }

    if (!description) {
      return res.status(400).json({ message: 'Job description or Job ID is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        console.log('🤖 Utilizing Gemini AI for semantic ATS resume matching...');
        const prompt = `
You are an expert ATS (Applicant Tracking System) parser and resume optimizer.
Compare the following candidate resume and target job description.

RESUME:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${description}
"""

Analyze the comparison and return a JSON object with:
1. "score": An integer from 0 to 100 representing how closely the resume fits the job requirements.
2. "matchingSkills": An array of matching technical/professional keywords found in both (in uppercase).
3. "missingKeywords": An array of key technical/professional keywords required by the job but missing or weak in the resume (in uppercase).
4. "recommendations": An array of objects, each containing:
   - "title": A short actionable title (e.g. "Add Node.js experience")
   - "description": A detailed explanation of why it is needed and how to address it.

Return ONLY a valid JSON object matching this schema. Do not write any markdown code blocks or explanations outside of the JSON.
`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const payload = {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        };

        const response = await axios.post(url, payload, { timeout: 20000 });
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text) {
          const parsed = JSON.parse(text.trim());
          if (typeof parsed.score === 'number' && Array.isArray(parsed.matchingSkills) && Array.isArray(parsed.missingKeywords) && Array.isArray(parsed.recommendations)) {
            return res.json({
              score: Math.min(100, Math.max(0, parsed.score)),
              matchingSkills: parsed.matchingSkills.slice(0, 10).map(s => s.toUpperCase()),
              missingKeywords: parsed.missingKeywords.slice(0, 10).map(s => s.toUpperCase()),
              recommendations: parsed.recommendations,
              isAI: true
            });
          }
        }
      } catch (err) {
        console.error('⚠️ Gemini AI Matcher failed or returned invalid JSON, falling back to local parsing:', err.message);
      }
    }

    const resumeTokens = tokenize(resumeText);
    const descTokens = tokenize(description);

    const resumeSet = new Set(resumeTokens);
    const descSet = new Set(descTokens);

    // Identify matching keywords (prioritize tech skills)
    const matching = [];
    const missing = [];

    descSet.forEach(word => {
      if (TECH_SKILLS.has(word) || word.length > 4) {
        if (resumeSet.has(word)) {
          matching.push(word);
        } else {
          missing.push(word);
        }
      }
    });

    // Calculate match score
    // Weighted Jaccard-like score leaning on tech skills
    let matchedTechCount = 0;
    let totalTechCount = 0;

    descSet.forEach(word => {
      if (TECH_SKILLS.has(word)) {
        totalTechCount++;
        if (resumeSet.has(word)) {
          matchedTechCount++;
        }
      }
    });

    const generalMatchRatio = descSet.size > 0 
      ? [...descSet].filter(word => resumeSet.has(word)).length / descSet.size 
      : 0;

    const techWeight = 0.7;
    const generalWeight = 0.3;

    const techScore = totalTechCount > 0 ? (matchedTechCount / totalTechCount) : generalMatchRatio;
    const combinedScore = (techScore * techWeight) + (generalMatchRatio * generalWeight);
    
    // Scale score between 25% and 95%
    let score = Math.round(combinedScore * 100);
    if (score < 25) score = 25 + Math.round(Math.random() * 10);
    if (score > 95) score = 95;

    // Generate specific recommendations
    const recommendations = [];
    const limitMissing = missing.slice(0, 5).map(w => w.toUpperCase());

    if (limitMissing.length > 0) {
      recommendations.push({
        title: 'Incorporate Missing Technical Keywords',
        description: `Integrate terms like ${limitMissing.join(', ')} naturally within your experience and skills sections.`
      });
    }

    if (resumeText.length < 500) {
      recommendations.push({
        title: 'Elaborate on Professional Experience',
        description: 'Your resume seems a bit brief. Expand on your project accomplishments, specifying tools and methodologies used.'
      });
    } else {
      recommendations.push({
        title: 'Quantify Achievements',
        description: 'Include metric-based accomplishments (e.g., "reduced latency by 15%" or "mentored 3 junior developers") to validate impact.'
      });
    }

    recommendations.push({
      title: 'Formatting & Layout',
      description: 'Ensure your resume uses standard ATS-readable fonts (Arial, Calibri) and avoids complex multi-column grids or graphics.'
    });

    res.json({
      score,
      matchingSkills: matching.slice(0, 10).map(w => w.toUpperCase()),
      missingKeywords: missing.slice(0, 10).map(w => w.toUpperCase()),
      recommendations
    });
  } catch (err) {
    next(err);
  }
};
