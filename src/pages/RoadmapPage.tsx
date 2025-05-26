import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // May not be needed here
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Circle, Sparkles, BookOpen, ArrowRight, Download } from 'lucide-react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.vfs;

// Copied from Index.tsx
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

interface RoadmapPageProps {
  initialRoadmap: Roadmap; // Changed from roadmap
  onUpdate: (updatedRoadmap: Roadmap) => void; // Changed from setRoadmap
  onBack: () => void; // Added onBack prop
  geminiApiKey: string;
}

const RoadmapPage: React.FC<RoadmapPageProps> = ({ initialRoadmap, onUpdate, onBack, geminiApiKey }) => {
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap>(initialRoadmap);
  const [customization, setCustomization] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { toast } = useToast(); 

  // PDF Export Function
  const exportToPdf = () => {
    if (!currentRoadmap) return;

    const documentDefinition = {
      content: [
        { text: currentRoadmap.topic, style: 'header' },
        { text: `Generated on: ${new Date(currentRoadmap.createdAt).toLocaleDateString()}`, style: 'subheader' },
        '\n',
        { text: 'This document provides a detailed learning roadmap. Each step includes a description and a recommended resource to guide your learning journey. Bulletins and additional notes can be added here to further enrich the content.', style: 'intro' },
        '\n\n',
        ...currentRoadmap.steps.flatMap((step, index) => [
          {
            text: `${index + 1}. ${step.title} ${step.completed ? '(Completed)' : ''}`,
            style: 'stepTitle',
            margin: [0, 0, 0, 5], // bottom margin
          },
          { text: step.description, style: 'stepDescription', margin: [10, 0, 0, 10] }, // left and bottom margin
          {
            text: 'Resource:',
            style: 'resourceHeader',
            margin: [10, 0, 0, 2], // left and bottom margin
          },
          {
            ul: [
              `${step.resource.title}${step.resource.url ? ` (${step.resource.url})` : ''}`,
              step.resource.description,
            ],
            style: 'resourceDetails',
            margin: [20, 0, 0, 15], // left and bottom margin
          },
          '\n',
        ]),
        '\n\n',
        { text: 'Happy Learning!', style: 'footer', alignment: 'center' }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10] // bottom margin
        },
        subheader: {
          fontSize: 10,
          italics: true,
          alignment: 'center',
          margin: [0, 0, 0, 20] // bottom margin
        },
        intro: {
          fontSize: 10,
          italics: true,
          margin: [0,0,0,10]
        },
        stepTitle: {
          fontSize: 16,
          bold: true,
        },
        stepDescription: {
          fontSize: 12,
          margin: [0, 5, 0, 5]
        },
        resourceHeader: {
          fontSize: 12,
          bold: true,
          italics: true,
        },
        resourceDetails: {
          fontSize: 11,
          margin: [0, 2, 0, 10]
        },
        footer: {
            fontSize: 12,
            bold: true,
            italics: true,
            margin: [0, 20, 0, 0] // top margin
        }
      },
      defaultStyle: {
        font: 'Roboto' // Ensure Roboto is available or use a standard font
      }
    };

    try {
      // @ts-ignore TODO: Check pdfmake types for proper document definition typing
      pdfMake.createPdf(documentDefinition).download(`${currentRoadmap.topic.replace(/\s+/g, '_').toLowerCase()}_roadmap.pdf`);
      toast({
        title: "PDF Exported",
        description: "Your roadmap has been exported as a PDF.",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "PDF Export Failed",
        description: "Could not generate the PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const customizeRoadmap = async () => {
    if (!customization.trim() || !currentRoadmap) { // Changed roadmap to currentRoadmap
      toast({
        title: "Please enter customization request",
        description: "Tell us how you'd like to modify the roadmap!",
        variant: "destructive"
      });
      return;
    }

    setIsCustomizing(true);
    
    try {
      const currentRoadmapJson = JSON.stringify(currentRoadmap, null, 2); // Changed roadmap to currentRoadmap
      const prompt = `Here is the current roadmap:
      ${currentRoadmapJson}
      
      User request: "${customization}"
      
      Please modify the roadmap according to the user's request and return the updated JSON object with the same structure. Maintain the completion status of existing steps where possible. Return only the JSON object.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const updatedRoadmapData = JSON.parse(jsonMatch[0]);
      
      const stepsWithPreservedStatus = updatedRoadmapData.steps.map((step: any, index: number) => {
        const existingStep = currentRoadmap.steps.find(s => s.id === step.id); // Changed roadmap to currentRoadmap
        return {
          ...step,
          id: step.id || `step-${index + 1}`,
          completed: existingStep ? existingStep.completed : false
        };
      });

      const newRoadmapState = { // Create new state object
        ...updatedRoadmapData,
        steps: stepsWithPreservedStatus,
        createdAt: currentRoadmap.createdAt // Preserve original creation date, Changed roadmap to currentRoadmap
      };
      setCurrentRoadmap(newRoadmapState); // Update local state
      onUpdate(newRoadmapState); // Call onUpdate prop
      
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
    if (!currentRoadmap) return; // Add guard for currentRoadmap
    const updatedSteps = currentRoadmap.steps.map(step =>  // Changed roadmap to currentRoadmap
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    const newRoadmapState = { ...currentRoadmap, steps: updatedSteps }; // Changed roadmap to currentRoadmap
    setCurrentRoadmap(newRoadmapState); // Update local state
    onUpdate(newRoadmapState); // Call onUpdate prop
  };

  const handleBack = () => { // Renamed function
    onBack(); // Call onBack prop
    // Toast message for returning to landing page is handled in Index.tsx's resetToLandingPage
  };

  const calculateProgress = () => {
    if (!currentRoadmap || currentRoadmap.steps.length === 0) return 0; // Changed roadmap to currentRoadmap
    const completedSteps = currentRoadmap.steps.filter(step => step.completed).length; // Changed roadmap to currentRoadmap
    return Math.round((completedSteps / currentRoadmap.steps.length) * 100); // Changed roadmap to currentRoadmap
  };

  if (!currentRoadmap) return null; // Changed roadmap to currentRoadmap

  return (
    <>
      {/* Customization */}
      <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
              disabled={isCustomizing || !customization.trim() || !geminiApiKey}
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

      {/* Progress Overview */}
      <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl">{currentRoadmap.topic}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} size="sm">
                Back to Topics
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col'>
          <div className="space-y-4 mb-2">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-700">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-3 " />
            </div>
            <p className="text-sm text-gray-600">
              {currentRoadmap.steps.filter(s => s.completed).length} of {currentRoadmap.steps.length} steps completed
            </p>
          </div>
          <Button variant="outline" onClick={exportToPdf} size="sm" title="Export to PDF" className='bg-gradient-to-r from-blue-50 to-purple-50'>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </CardContent>
      </Card>

      {/* Roadmap Steps */}
      <div className="space-y-4 mb-6">
        {currentRoadmap.steps.map((step, index) => (
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
                  <CardTitle className={`text-lg font-poppins ${step.completed ? 'text-green-800' : 'text-gray-800'}`}>
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
    </>
  );
};

export default RoadmapPage;