
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Circle, Sparkles, Target, BookOpen, ArrowRight } from 'lucide-react';

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

const Index = () => {
  const [topic, setTopic] = useState('');
  const [customization, setCustomization] = useState('');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [apiKey, setApiKey] = useState('');
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

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to generate roadmaps.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
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

        {/* API Key Input */}
        {!apiKey && (
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
                disabled={isGenerating || !apiKey}
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
        {!roadmap && apiKey && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Start Learning?</h3>
            <p className="text-gray-500">Enter any topic above and let AI create a personalized roadmap for you!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
