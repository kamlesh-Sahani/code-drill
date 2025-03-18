'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import run from '@/lib/gemini';

export default function Home() {
  const [questions, setQuestions] = useState<any>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userTopic, setUserTopic] = useState<string>(''); // User-defined topic
  const [userAnswer, setUserAnswer] = useState<string>(''); // For fill-in-the-blank and output-based questions

  // Fetch questions from Gemini API
  const fetchQuestions = async (topic: string) => {
    if (!topic.trim()) {
      alert('Please enter a topic!');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Generate 20 questions for the topic "${topic}" with the following types:
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
      const generatedQuestions = JSON.parse(response);
      setQuestions(generatedQuestions);
      setCurrentQuestion(0); // Reset to the first question
      setScore(0); // Reset score
    } catch (error: any) {
      console.error('Error fetching questions:', error.message);
      alert('Failed to fetch questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle starting the quiz
  const handleStart = () => {
    fetchQuestions(userTopic);
  };

  // Handle user answers
  const handleAnswer = (isCorrect: boolean | string) => {
    if (isCorrect) setScore(score + 1);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer(''); // Reset user answer for the next question
    } else {
      alert(`Quiz finished! Your score is ${score + (isCorrect ? 1 : 0)}/${questions.length}`);
    }
  };

  // Handle input change for fill-in-the-blank and output-based questions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserAnswer(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Top Bar */}
      <div className="bg-gray-800 p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold text-purple-400">CodeDrill</h1>
        <div className="flex items-center space-x-6">
          <span className="text-emerald-300 font-semibold">
            Score: {score} / {questions.length}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-6"
      >
        {/* Topic Input */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Enter a topic (e.g., JavaScript, Frontend, Aptitude)"
            value={userTopic}
            onChange={(e) => setUserTopic(e.target.value)}
            className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleStart}
            disabled={isLoading || !userTopic.trim()}
            className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Start Practice'}
          </button>
        </div>

        {questions.length > 0 && (
          <>
            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-3 mb-8">
              <div
                className="bg-purple-500 h-3 rounded-full"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Question Card */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-purple-300 mb-6">
                {questions[currentQuestion].text}
              </h2>

              {/* MCQ Options */}
              {questions[currentQuestion].type === 'MCQ' && (
                <div className="space-y-4">
                  {questions[currentQuestion].options.map((option: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option.isCorrect)}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 text-left"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Fill in the Blank */}
              {questions[currentQuestion].type === 'Fill in the Blank' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Type your answer here"
                    value={userAnswer}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => handleAnswer(userAnswer.toLocaleLowerCase() === questions[currentQuestion].answer.toLocaleLowerCase())}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Submit
                  </button>
                </div>
              )}

              {/* Output-Based Question */}
              {questions[currentQuestion].type === 'Output-Based' && (
                <div className="space-y-4">
                  <textarea
                    placeholder="Write your code here"
                    value={userAnswer}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                  />
                  <button
                    onClick={() => handleAnswer(true)} // Replace with actual evaluation logic
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Submit
                  </button>
                </div>
              )}

              {/* True/False Question */}
              {questions[currentQuestion].type === 'True/False' && (
                <div className="space-y-4">
                  <button
                    onClick={() => handleAnswer(questions[currentQuestion].answer === true)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    True
                  </button>
                  <button
                    onClick={() => handleAnswer(questions[currentQuestion].answer === false)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
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