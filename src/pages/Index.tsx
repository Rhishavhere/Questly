
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Circle, Sparkles, Target, BookOpen, ArrowRight, Info } from 'lucide-react';

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  resource: {
    title: string;
    url?: string;
    description: string;
  };
  completed: boolean;
}

interface Roadmap {
  topic: string;
  steps: RoadmapStep[];
  createdAt: string;
}

// Sample roadmaps for demo purposes
const sampleRoadmaps: { [key: string]: Omit<Roadmap, 'createdAt'> } = {
  "react": {
    topic: "Learn React Development",
    steps: [
      {
        id: "step-1",
        title: "JavaScript Fundamentals",
        description: "Master ES6+ features including arrow functions, destructuring, modules, and async/await. Understanding these concepts is crucial for React development.",
        resource: {
          title: "JavaScript.info - Modern JavaScript Tutorial",
          url: "https://javascript.info/",
          description: "Comprehensive guide covering all modern JavaScript features"
        },
        completed: false
      },
      {
        id: "step-2",
        title: "React Basics and JSX",
        description: "Learn React components, JSX syntax, and how React renders elements. Understand the virtual DOM and React's declarative approach.",
        resource: {
          title: "React Official Tutorial",
          url: "https://react.dev/learn",
          description: "Official React documentation with interactive examples"
        },
        completed: false
      },
      {
        id: "step-3",
        title: "Component State and Props",
        description: "Understand how to manage state within components and pass data between components using props. Learn about controlled vs uncontrolled components.",
        resource: {
          title: "React State and Lifecycle",
          url: "https://react.dev/learn/state-a-components-memory",
          description: "Deep dive into React state management"
        },
        completed: false
      },
      {
        id: "step-4",
        title: "React Hooks",
        description: "Master useState, useEffect, and other built-in hooks. Learn how to create custom hooks for reusable logic.",
        resource: {
          title: "React Hooks Documentation",
          url: "https://react.dev/reference/react",
          description: "Complete guide to React hooks with examples"
        },
        completed: false
      },
      {
        id: "step-5",
        title: "Event Handling and Forms",
        description: "Learn how to handle user interactions, form submissions, and input validation in React applications.",
        resource: {
          title: "React Forms Guide",
          url: "https://react.dev/learn/reacting-to-input-with-state",
          description: "Best practices for handling forms in React"
        },
        completed: false
      },
      {
        id: "step-6",
        title: "React Router",
        description: "Implement client-side routing in your React applications for multi-page experiences.",
        resource: {
          title: "React Router Documentation",
          url: "https://reactrouter.com/",
          description: "Official documentation for React Router with examples"
        },
        completed: false
      },
      {
        id: "step-7",
        title: "State Management with Redux",
        description: "Learn how to manage complex application state using Redux. Understand actions, reducers, and the store.",
        resource: {
          title: "Redux Essentials Tutorial",
          url: "https://redux.js.org/tutorials/essentials/part-1-overview-concepts",
          description: "Step-by-step guide to learning Redux"
        },
        completed: false
      },
      {
        id: "step-8",
        title: "Build a Full React Application",
        description: "Apply all learned concepts by building a complete React application from scratch, including routing, state management, and API integration.",
        resource: {
          title: "Full Stack Open",
          url: "https://fullstackopen.com/",
          description: "Free full stack course with focus on React"
        },
        completed: false
      }
    ]
  },
  "python": {
    topic: "Master Python Programming",
    steps: [
      {
        id: "step-1",
        title: "Python Basics",
        description: "Learn Python syntax, variables, data types, and basic operations. Understand how Python differs from other programming languages.",
        resource: {
          title: "Python.org Official Tutorial",
          url: "https://docs.python.org/3/tutorial/",
          description: "Comprehensive introduction to Python programming"
        },
        completed: false
      },
      {
        id: "step-2",
        title: "Control Flow",
        description: "Master conditionals (if, elif, else), loops (for, while), and control statements like break and continue.",
        resource: {
          title: "Real Python - Python Conditional Statements",
          url: "https://realpython.com/python-conditional-statements/",
          description: "Detailed explanation of Python control flow with examples"
        },
        completed: false
      },
      {
        id: "step-3",
        title: "Functions and Modules",
        description: "Learn to define functions, pass arguments, return values, and organize code into reusable modules.",
        resource: {
          title: "Python Functions Guide",
          url: "https://realpython.com/defining-your-own-python-function/",
          description: "Everything about Python functions with practical examples"
        },
        completed: false
      },
      {
        id: "step-4",
        title: "Data Structures",
        description: "Understand Python's built-in data structures: lists, tuples, sets, and dictionaries. Learn when to use each one.",
        resource: {
          title: "Python Data Structures Tutorial",
          url: "https://docs.python.org/3/tutorial/datastructures.html",
          description: "Official documentation on Python data structures"
        },
        completed: false
      },
      {
        id: "step-5",
        title: "File Handling",
        description: "Learn to read from and write to files, handle different file formats, and work with file paths.",
        resource: {
          title: "Working with Files in Python",
          url: "https://realpython.com/read-write-files-python/",
          description: "Complete guide to file operations in Python"
        },
        completed: false
      },
      {
        id: "step-6",
        title: "Object-Oriented Programming",
        description: "Master OOP concepts like classes, objects, inheritance, encapsulation, and polymorphism in Python.",
        resource: {
          title: "Python OOP Tutorial",
          url: "https://realpython.com/python3-object-oriented-programming/",
          description: "Practical guide to OOP in Python with examples"
        },
        completed: false
      },
      {
        id: "step-7",
        title: "Error Handling",
        description: "Learn about Python exceptions, how to handle errors with try-except blocks, and create custom exceptions.",
        resource: {
          title: "Python Exceptions Guide",
          url: "https://docs.python.org/3/tutorial/errors.html",
          description: "Official documentation on error handling in Python"
        },
        completed: false
      },
      {
        id: "step-8",
        title: "Libraries and Frameworks",
        description: "Explore popular Python libraries like Pandas, NumPy, and frameworks like Django or Flask.",
        resource: {
          title: "Python Libraries Introduction",
          url: "https://www.pythonforbeginners.com/learn-python/python-standard-library-tutorial/",
          description: "Overview of essential Python libraries and how to use them"
        },
        completed: false
      }
    ]
  },
  "web": {
    topic: "Web Development Fundamentals",
    steps: [
      {
        id: "step-1",
        title: "HTML Basics",
        description: "Learn the structure of web pages, semantic HTML tags, forms, and multimedia elements.",
        resource: {
          title: "MDN Web Docs - HTML",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
          description: "Comprehensive guide to HTML elements and best practices"
        },
        completed: false
      },
      {
        id: "step-2",
        title: "CSS Fundamentals",
        description: "Master CSS selectors, box model, positioning, responsive design with media queries, and layouts.",
        resource: {
          title: "CSS Tricks",
          url: "https://css-tricks.com/",
          description: "Website with tutorials and guides for CSS techniques"
        },
        completed: false
      },
      {
        id: "step-3",
        title: "JavaScript Essentials",
        description: "Learn core JavaScript concepts, DOM manipulation, events, and asynchronous programming.",
        resource: {
          title: "JavaScript.info",
          url: "https://javascript.info/",
          description: "Modern JavaScript tutorial with interactive examples"
        },
        completed: false
      },
      {
        id: "step-4",
        title: "Responsive Design",
        description: "Understand mobile-first approach, flexible grids, and media queries to build responsive websites.",
        resource: {
          title: "Responsive Web Design Fundamentals",
          url: "https://web.dev/responsive-web-design-basics/",
          description: "Google's guide to responsive web design"
        },
        completed: false
      },
      {
        id: "step-5",
        title: "Web APIs",
        description: "Learn to use browser APIs like Fetch for HTTP requests, LocalStorage, and more.",
        resource: {
          title: "MDN Web API Reference",
          url: "https://developer.mozilla.org/en-US/docs/Web/API",
          description: "Comprehensive documentation of web APIs"
        },
        completed: false
      },
      {
        id: "step-6",
        title: "Build Tools and Package Managers",
        description: "Learn to use npm/yarn, webpack, and other build tools to optimize your workflow.",
        resource: {
          title: "NPM Documentation",
          url: "https://docs.npmjs.com/",
          description: "Official npm documentation and guides"
        },
        completed: false
      },
      {
        id: "step-7",
        title: "Framework Basics",
        description: "Get started with a popular framework like React, Vue, or Angular for building complex applications.",
        resource: {
          title: "React Official Tutorial",
          url: "https://react.dev/learn",
          description: "Step-by-step guide to learning React"
        },
        completed: false
      },
      {
        id: "step-8",
        title: "Web Performance",
        description: "Learn techniques to optimize loading speed, reduce bundle size, and create smooth user experiences.",
        resource: {
          title: "Web.dev Performance",
          url: "https://web.dev/performance/",
          description: "Best practices for web performance optimization"
        },
        completed: false
      }
    ]
  }
};

const Index = () => {
  const [topic, setTopic] = useState('');
  const [customization, setCustomization] = useState('');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [demoMode, setDemoMode] = useState(true);
  const { toast } = useToast();

  // Load roadmap and API key from localStorage on component mount
  useEffect(() => {
    const savedRoadmap = localStorage.getItem('stepwise-roadmap');
    const savedApiKey = localStorage.getItem('stepwise-api-key');
    
    if (savedRoadmap) {
      try {
        setRoadmap(JSON.parse(savedRoadmap));
      } catch (error) {
        console.error('Error parsing saved roadmap:', error);
      }
    }
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setDemoMode(false);
    }
  }, []);

  // Save roadmap to localStorage whenever it changes
  useEffect(() => {
    if (roadmap) {
      localStorage.setItem('stepwise-roadmap', JSON.stringify(roadmap));
    }
  }, [roadmap]);

  // Save API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('stepwise-api-key', apiKey);
    }
  }, [apiKey]);

  const generateRoadmap = async () => {
    if (!topic.trim()) {
      toast({
        title: "Please enter a topic",
        description: "Tell us what you'd like to learn!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // In demo mode, use sample roadmaps
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call delay
        
        let matchedRoadmap = null;
        const lowerTopic = topic.toLowerCase();
        
        if (lowerTopic.includes('react')) {
          matchedRoadmap = sampleRoadmaps.react;
        } else if (lowerTopic.includes('python')) {
          matchedRoadmap = sampleRoadmaps.python;
        } else if (lowerTopic.includes('web')) {
          matchedRoadmap = sampleRoadmaps.web;
        } else {
          // Default to web development if no match
          matchedRoadmap = sampleRoadmaps.web;
        }
        
        const newRoadmap: Roadmap = {
          ...matchedRoadmap,
          topic: topic,
          createdAt: new Date().toISOString()
        };
        
        setRoadmap(newRoadmap);
        toast({
          title: "Demo Roadmap Generated!",
          description: `Created a ${matchedRoadmap.steps.length}-step roadmap for ${topic}`,
        });
        return;
      }
      
      // If API key is provided, use Gemini API
      if (!apiKey.trim()) {
        toast({
          title: "API Key Required",
          description: "Please enter your Gemini API key to generate roadmaps.",
          variant: "destructive"
        });
        return;
      }

      const prompt = `Create a detailed learning roadmap for "${topic}". Return a JSON object with this exact structure:
      {
        "topic": "${topic}",
        "steps": [
          {
            "id": "step-1",
            "title": "Step title here",
            "description": "Detailed description of what to learn/do in this step",
            "resource": {
              "title": "Resource name",
              "url": "https://example.com (if available)",
              "description": "Brief description of the recommended resource"
            }
          }
        ]
      }
      
      Create 8-12 comprehensive steps that take someone from beginner to intermediate level. Each step should have a specific, actionable title and detailed description. For resources, recommend real websites, tutorials, books, or tools when possible. Make sure the JSON is valid and properly formatted.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const roadmapData = JSON.parse(jsonMatch[0]);
      
      // Add IDs and completion status to steps
      const stepsWithIds = roadmapData.steps.map((step: any, index: number) => ({
        ...step,
        id: step.id || `step-${index + 1}`,
        completed: false
      }));

      const newRoadmap: Roadmap = {
        topic: roadmapData.topic,
        steps: stepsWithIds,
        createdAt: new Date().toISOString()
      };

      setRoadmap(newRoadmap);
      setDemoMode(false);
      
      toast({
        title: "Roadmap Generated!",
        description: `Created a ${stepsWithIds.length}-step roadmap for ${topic}`,
      });
      
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Generation Failed",
        description: "Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const customizeRoadmap = async () => {
    if (!customization.trim() || !roadmap) {
      toast({
        title: "Please enter customization request",
        description: "Tell us how you'd like to modify the roadmap!",
        variant: "destructive"
      });
      return;
    }

    setIsCustomizing(true);
    
    try {
      // In demo mode, simulate customization
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call delay
        
        // Simple customization logic for demo
        const lowerCustomization = customization.toLowerCase();
        let updatedRoadmap = { ...roadmap };
        
        if (lowerCustomization.includes('add beginner') || lowerCustomization.includes('more basic')) {
          // Add a beginner step
          const beginnerStep = {
            id: `step-${Date.now()}`,
            title: "Getting Started - Environment Setup",
            description: "Set up your development environment with all necessary tools and software for your learning journey.",
            resource: {
              title: "Beginner's Setup Guide",
              url: "https://example.com/setup",
              description: "Step-by-step guide to setting up your environment"
            },
            completed: false
          };
          
          updatedRoadmap.steps = [beginnerStep, ...updatedRoadmap.steps];
        } else if (lowerCustomization.includes('advanced') || lowerCustomization.includes('more difficult')) {
          // Add an advanced step
          const advancedStep = {
            id: `step-${Date.now()}`,
            title: "Advanced Project Implementation",
            description: "Build a complex project that integrates all the concepts you've learned so far.",
            resource: {
              title: "Advanced Project Tutorial",
              url: "https://example.com/advanced",
              description: "Comprehensive guide to building advanced projects"
            },
            completed: false
          };
          
          updatedRoadmap.steps = [...updatedRoadmap.steps, advancedStep];
        } else if (lowerCustomization.includes('shorter') || lowerCustomization.includes('simplify')) {
          // Make it shorter by removing some middle steps
          if (updatedRoadmap.steps.length > 4) {
            const midPoint = Math.floor(updatedRoadmap.steps.length / 2);
            updatedRoadmap.steps = [
              ...updatedRoadmap.steps.slice(0, midPoint - 1),
              ...updatedRoadmap.steps.slice(midPoint + 1)
            ];
          }
        } else if (lowerCustomization.includes('project') || lowerCustomization.includes('practical')) {
          // Add a project-based step
          const projectStep = {
            id: `step-${Date.now()}`,
            title: "Hands-on Project Implementation",
            description: "Apply theoretical knowledge by building a real-world project from scratch.",
            resource: {
              title: "Project-Based Learning Guide",
              url: "https://example.com/projects",
              description: "Collection of practical projects with tutorials"
            },
            completed: false
          };
          
          // Insert in the middle
          const midPoint = Math.floor(updatedRoadmap.steps.length / 2);
          updatedRoadmap.steps = [
            ...updatedRoadmap.steps.slice(0, midPoint),
            projectStep,
            ...updatedRoadmap.steps.slice(midPoint)
          ];
        }
        
        setRoadmap(updatedRoadmap);
        setCustomization('');
        
        toast({
          title: "Demo Roadmap Updated!",
          description: "Your roadmap has been customized based on your request.",
        });
        return;
      }

      // If API key is available, use Gemini API
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please enter your Gemini API key to customize roadmaps.",
          variant: "destructive"
        });
        return;
      }
      
      const currentRoadmapJson = JSON.stringify(roadmap, null, 2);
      const prompt = `Here is the current roadmap:
      ${currentRoadmapJson}
      
      User request: "${customization}"
      
      Please modify the roadmap according to the user's request and return the updated JSON object with the same structure. Maintain the completion status of existing steps where possible. Return only the JSON object.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const updatedRoadmap = JSON.parse(jsonMatch[0]);
      
      // Preserve completion status from existing steps
      const stepsWithPreservedStatus = updatedRoadmap.steps.map((step: any, index: number) => {
        const existingStep = roadmap.steps.find(s => s.id === step.id);
        return {
          ...step,
          id: step.id || `step-${index + 1}`,
          completed: existingStep ? existingStep.completed : false
        };
      });

      setRoadmap({
        ...updatedRoadmap,
        steps: stepsWithPreservedStatus,
        createdAt: roadmap.createdAt
      });
      
      setCustomization('');
      toast({
        title: "Roadmap Updated!",
        description: "Your roadmap has been customized successfully.",
      });
      
    } catch (error) {
      console.error('Error customizing roadmap:', error);
      toast({
        title: "Customization Failed",
        description: "Please try again with a different request.",
        variant: "destructive"
      });
    } finally {
      setIsCustomizing(false);
    }
  };

  const toggleStepCompletion = (stepId: string) => {
    if (!roadmap) return;
    
    const updatedSteps = roadmap.steps.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    
    setRoadmap({ ...roadmap, steps: updatedSteps });
  };

  const resetRoadmap = () => {
    setRoadmap(null);
    setTopic('');
    setCustomization('');
    localStorage.removeItem('stepwise-roadmap');
    toast({
      title: "Roadmap Reset",
      description: "Start fresh with a new learning journey!",
    });
  };

  const calculateProgress = () => {
    if (!roadmap || roadmap.steps.length === 0) return 0;
    const completedSteps = roadmap.steps.filter(step => step.completed).length;
    return Math.round((completedSteps / roadmap.steps.length) * 100);
  };

  const toggleDemoMode = () => {
    if (!demoMode) {
      setApiKey('');
      localStorage.removeItem('stepwise-api-key');
    }
    setDemoMode(!demoMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stepwise
            </h1>
          </div>
          <p className="text-gray-600 text-lg">AI-powered roadmap generator for your learning journey</p>
        </div>

        {/* Demo Mode Toggle */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  {demoMode ? "Demo Mode: Using sample roadmaps" : "API Mode: Using Gemini AI"}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={toggleDemoMode}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {demoMode ? "Switch to API Mode" : "Switch to Demo Mode"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Key Input */}
        {!demoMode && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Gemini API Key Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700 mb-4">
                Please enter your Gemini API key to generate AI-powered roadmaps.
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => toast({ title: "API Key Saved", description: "You can now generate roadmaps!" })}
                  disabled={!apiKey.trim()}
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Topic Input */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              What would you like to learn?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Learn React development, Master digital marketing, Study data science..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generateRoadmap()}
                className="flex-1 text-lg"
                disabled={isGenerating}
              />
              <Button 
                onClick={generateRoadmap} 
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </div>
                )}
              </Button>
            </div>
            {demoMode && (
              <p className="text-gray-500 text-sm mt-2">
                Demo mode supports sample roadmaps for "React", "Python", and "Web Development" topics
              </p>
            )}
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {roadmap && (
          <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{roadmap.topic}</CardTitle>
                <Button variant="outline" onClick={resetRoadmap} size="sm">
                  Start New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-gray-700">{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-3" />
                </div>
                <p className="text-sm text-gray-600">
                  {roadmap.steps.filter(s => s.completed).length} of {roadmap.steps.length} steps completed
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roadmap Steps */}
        {roadmap && (
          <div className="space-y-4 mb-6">
            {roadmap.steps.map((step, index) => (
              <Card 
                key={step.id} 
                className={`shadow-lg border-0 transition-all duration-300 ${
                  step.completed 
                    ? 'bg-green-50 border-l-4 border-l-green-500' 
                    : 'bg-white/80 backdrop-blur-sm hover:shadow-xl'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStepCompletion(step.id)}
                      className="mt-1 transition-colors"
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-blue-600" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">Step {index + 1}</span>
                      </div>
                      <CardTitle className={`text-lg ${step.completed ? 'text-green-800' : 'text-gray-800'}`}>
                        {step.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={`mb-4 ${step.completed ? 'text-green-700' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Recommended Resource</span>
                    </div>
                    <p className="text-sm font-medium text-blue-700 mb-1">{step.resource.title}</p>
                    <p className="text-sm text-blue-600 mb-2">{step.resource.description}</p>
                    {step.resource.url && (
                      <a 
                        href={step.resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Visit Resource <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Customization */}
        {roadmap && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Customize Your Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="e.g., Add a beginner section, Remove advanced topics, Focus more on practical projects..."
                  value={customization}
                  onChange={(e) => setCustomization(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isCustomizing}
                />
                <Button 
                  onClick={customizeRoadmap} 
                  disabled={isCustomizing || !customization.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isCustomizing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Update Roadmap
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!roadmap && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Start Learning?</h3>
            <p className="text-gray-500">Enter any topic above and let {demoMode ? 'our samples' : 'AI'} create a personalized roadmap for you!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
