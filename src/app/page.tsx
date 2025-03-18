'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import run from '@/lib/gemini';

export default function Home() {
  const [questions, setQuestions] = useState<any>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('JavaScript'); // Default topic

  // Function to fetch questions from Gemini API
  const fetchQuestions = async (topic:string) => {
    setIsLoading(true);
    try {
      const prompt = `Generate 5 questions for the topic "${topic}" with the following types:
      1. Multiple Choice Questions (MCQs)
      2. Fill in the Blanks
      3. Output-Based Questions
      4. True/False Questions

      Ensure the questions are suitable for an advanced level. Return the response as a JSON array in the following format:
      [
        {
          "text": "Question text",
          "type": "MCQ",
          "options": [
            { "text": "Option 1", "isCorrect": true },
            { "text": "Option 2", "isCorrect": false },
            { "text": "Option 3", "isCorrect": false },
            { "text": "Option 4", "isCorrect": false }
          ]
        },
        {
          "text": "Question text",
          "type": "Fill in the Blank",
          "answer": "Correct answer"
        },
        {
          "text": "Question text",
          "type": "Output-Based",
          "answer": "Expected output"
        },
        {
          "text": "Question text",
          "type": "True/False",
          "answer": true
        }
      ]`;

      const response = await run(prompt);

      // Parse the response and format questions
      const generatedQuestions = JSON.parse(response);
      console.log(generatedQuestions, "Generated Questions");
      setQuestions(generatedQuestions);
    } catch (error:any) {
      console.error('Error fetching questions:', error.message);
      alert('Failed to fetch questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    fetchQuestions(selectedTopic);
  };

  const handleAnswer = (isCorrect:string | boolean) => {
    if (isCorrect) setScore(score + 1);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      alert(`Quiz finished! Your score is ${score + (isCorrect ? 1 : 0)}/${questions.length}`);
    }
  };



  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="bg-gray-800 p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold text-purple-500">CodeDrill</h1>
        <div className="flex items-center space-x-4">
          <span className="text-emerald-400">Score: {score}</span>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded"
          >
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="React">React</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-8"
      >
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Start Practice'}
            </button>
          </div>
        ) : (
          <>
            <div className="w-full bg-gray-800 rounded-full h-2.5 mb-8">
              <div
                className="bg-purple-500 h-2.5 rounded-full"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">{questions[currentQuestion].text}</h2>
              {questions[currentQuestion].type === 'MCQ' && (
                <div className="space-y-4">
                  {questions[currentQuestion].options.map((option:any, index:number) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option.isCorrect)}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-all duration-200"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              )}
              {questions[currentQuestion].type === 'Fill in the Blank' && (
                <input
                  type="text"
                  placeholder="Your answer"
                  className="w-full bg-gray-700 text-white p-2 rounded"
                  onBlur={(e:any) => handleAnswer(e.target.value === questions[currentQuestion].answer)}
                />
              )}
              {questions[currentQuestion].type === 'Output-Based' && (
                <div>
                  <textarea
                    placeholder="Write your code here"
                    className="w-full bg-gray-700 text-white p-2 rounded"
                  />
                  <button
                    onClick={() => handleAnswer(true)} // Replace with actual evaluation logic
                    className="mt-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Submit
                  </button>
                </div>
              )}
              {questions[currentQuestion].type === 'True/False' && (
                <div className="space-y-4">
                  <button
                    onClick={() => handleAnswer(questions[currentQuestion].answer === true)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-all duration-200"
                  >
                    True
                  </button>
                  <button
                    onClick={() => handleAnswer(questions[currentQuestion].answer === false)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-all duration-200"
                  >
                    False
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}