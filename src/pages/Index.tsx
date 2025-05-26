
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Progress, Textarea, CheckCircle2, Circle will be used in RoadmapPage
import { Sparkles, Target, BookOpen, ArrowRight, List, Trash2 } from 'lucide-react';
import RoadmapPage from './RoadmapPage'; // Import RoadmapPage

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

export interface Roadmap { // Exporting for RoadmapPage
  id: string; 
  topic: string;
  steps: RoadmapStep[];
  createdAt: string;
}

const Index = () => {
  const [topic, setTopic] = useState('');
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [roadmapsList, setRoadmapsList] = useState<Roadmap[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  // isCustomizing will be in RoadmapPage
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const { toast } = useToast();

  // Load roadmapsList from localStorage on component mount
  useEffect(() => {
    const savedRoadmapsList = localStorage.getItem('stepwise-roadmaps-list');
    if (savedRoadmapsList) {
      try {
        setRoadmapsList(JSON.parse(savedRoadmapsList));
      } catch (error) {
        console.error('Error parsing saved roadmaps list:', error);
      }
    }
  }, []);

  // Save roadmapsList to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('stepwise-roadmaps-list', JSON.stringify(roadmapsList));
  }, [roadmapsList]);



  const generateRoadmap = async () => {
    if (!topic.trim()) {
      toast({
        title: "Please enter a topic",
        description: "Tell us what you'd like to learn!",
        variant: "destructive"
      });
      return;
    }

    if (!geminiApiKey) {
      toast({
        title: "API Key Not Found",
        description: "Please ensure your VITE_GEMINI_API_KEY is set in the .env file.",
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

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
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
        id: topic.toLowerCase().replace(/\s+/g, '-') + '-' + new Date().toISOString(), // Generate unique ID
        topic: roadmapData.topic,
        steps: stepsWithIds,
        createdAt: new Date().toISOString()
      };

      setRoadmapsList(prevList => [newRoadmap, ...prevList]);
      setSelectedRoadmap(newRoadmap);
      setTopic(''); // Clear topic input after generation
      toast({
        title: "Roadmap Generated!",
        description: `Created a ${stepsWithIds.length}-step roadmap for ${roadmapData.topic}`,
      });
      
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Generation Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // customizeRoadmap, toggleStepCompletion, calculateProgress will be in RoadmapPage.tsx

  const handleUpdateRoadmapInList = (updatedRoadmap: Roadmap) => {
    setRoadmapsList(prevList => 
      prevList.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r)
    );
    setSelectedRoadmap(updatedRoadmap); // Keep the updated roadmap selected
  };

  const handleDeleteRoadmapFromList = (roadmapId: string) => {
    setRoadmapsList(prevList => prevList.filter(r => r.id !== roadmapId));
    if (selectedRoadmap && selectedRoadmap.id === roadmapId) {
      setSelectedRoadmap(null); // Deselect if the deleted roadmap was selected
    }
    toast({
      title: "Roadmap Deleted",
      description: "The roadmap has been removed from your list.",
    });
  };

  const resetToLandingPage = () => {
    setSelectedRoadmap(null);
    // setTopic(''); // Topic is already cleared after generation or can be kept for re-gen
    toast({
      title: "Returned to Landing Page",
      description: "Choose a roadmap or generate a new one!",
    });
  };

  // This function is to clear the main topic input if needed, distinct from resetting a roadmap view
  const clearTopicInput = () => {
    setTopic(''); 
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

        {selectedRoadmap ? (
          <RoadmapPage 
            initialRoadmap={selectedRoadmap} 
            onUpdate={handleUpdateRoadmapInList} 
            onBack={resetToLandingPage} 
            geminiApiKey={geminiApiKey} // Pass API key for customization within RoadmapPage
          />
        ) : (
          <>
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
                    placeholder="e.g., Learn React development, Master digital marketing..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && generateRoadmap()}
                    className="flex-1 text-lg"
                    disabled={isGenerating}
                  />
                  <Button 
                    onClick={generateRoadmap} 
                    disabled={isGenerating || !geminiApiKey}
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

            {/* Previously Generated Roadmaps List */}
            {roadmapsList.length > 0 && (
              <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="w-5 h-5 text-blue-600" />
                    Your Previous Roadmaps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {roadmapsList.map((r) => (
                      <li key={r.id} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors flex justify-between items-center">
                        <div>
                          <button 
                            onClick={() => setSelectedRoadmap(r)} 
                            className="text-blue-600 hover:underline font-medium text-left"
                          >
                            {r.topic}
                          </button>
                          <p className="text-xs text-gray-500">Created: {new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRoadmapFromList(r.id)} title="Delete Roadmap">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Empty State for no roadmaps if API key is present */}
            {roadmapsList.length === 0 && geminiApiKey && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Start Learning?</h3>
                <p className="text-gray-500">Enter any topic above and let AI create a personalized roadmap for you!</p>
              </div>
            )}

            {/* API Key Missing Message */}
            {!geminiApiKey && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-700 mb-2">Gemini API Key Missing</h3>
                <p className="text-gray-500">Please configure your VITE_GEMINI_API_KEY in the .env file to use this application.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
