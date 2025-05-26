import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, HelpCircle, BookOpenText, LifeBuoy, Zap } from 'lucide-react';

const AppOverview = () => {
  return (
    <div className="my-12 mx-2 space-y-8">
      {/* Overview Section */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-serif text-gray-800">
            <Zap className="w-7 h-7 text-purple-600" />
            Welcome to Questly!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 space-y-3 font-poppins text-sm">
          <p>
            Questly is your guide to mastering new skills. Simply enter a topic you're curious about, and we'll generate a comprehensive, step-by-step learning roadmap for you.
          </p>
          <p>
            Each roadmap is designed to take you from beginner to an intermediate level, complete with curated resources and actionable tasks. Track your progress, customize your learning path, and achieve your goals faster than ever!
          </p>
        </CardContent>
      </Card>

      {/* How to Use Section */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-serif text-gray-800">
            <BookOpenText className="w-6 h-6 text-blue-600" />
            How to Use Questly
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 space-y-4 font-poppins text-sm">
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">1. Enter Your Topic:</h4>
            <p>In the input field above, type in any subject, skill, or concept you want to learn (e.g., "Learn Python", "Digital Marketing Basics", "Understand Quantum Physics").</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">2. Generate Roadmap:</h4>
            <p>Click the "Generate" button. Our AI will craft a personalized learning plan with 8-12 detailed steps.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">3. Explore & Learn:</h4>
            <p>Review your roadmap, click on resources, and mark steps as complete as you progress. You can also customize steps if needed (feature coming soon!).</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">4. Manage Your Roadmaps:</h4>
            <p>All your generated roadmaps are saved. Access them anytime from the "Your Previous Roadmaps" list on the main page.</p>
          </div>
        </CardContent>
      </Card>

      {/* Tips for Success Section */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-serif text-gray-800">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Tips for Effective Learning
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 space-y-3 font-poppins text-sm">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Be Specific:</strong> The more specific your topic, the more tailored your roadmap will be.</li>
            <li><strong>Consistency is Key:</strong> Try to dedicate regular time to your learning. Even short, focused sessions are effective.</li>
            <li><strong>Engage with Resources:</strong> Don't just read; actively engage with the suggested materials. Take notes, try exercises, and explore further.</li>
            <li><strong>Track Your Progress:</strong> Marking steps as complete provides a sense of accomplishment and helps you stay motivated.</li>
            <li><strong>Don't Be Afraid to Revisit:</strong> Learning is iterative. Feel free to go back to previous steps if you need a refresher.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-serif text-gray-800">
            <LifeBuoy className="w-6 h-6 text-red-500" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 font-poppins text-sm">
          <p>
            If you encounter any issues, have suggestions, or just want to share your learning journey, please feel free to reach out. 
          </p>
          <p className='mt-2'>
            Currently, you can open an issue or contribute to the project on <a href="https://github.com/Rhishavhere/Questly" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppOverview;