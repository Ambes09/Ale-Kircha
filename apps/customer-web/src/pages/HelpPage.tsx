import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface FAQ {
  id: string;
  questionEn: string;
  questionAm: string;
  answerEn: string;
  answerAm: string;
}

export default function HelpPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get('/api/v1/faq');
      if (response.data.success) {
        setFaqs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-red-600 text-white p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-white">← Back</Link>
          <h1 className="text-lg font-bold">Help & FAQ</h1>
          <button onClick={() => setLanguage(language === 'en' ? 'am' : 'en')} className="text-white">
            {language === 'en' ? '🇪🇹 አማርኛ' : '🇬🇧 English'}
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <p className="text-gray-600 mb-4">
          {language === 'en'
            ? 'Find answers to frequently asked questions about Digital Kircha.'
            : 'ስለ ዲጂታል ቅርጫ ተደጋጋሚ ጥያቄዎች መልስ ያግኙ።'}
        </p>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No FAQs available</div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => {
              const question = language === 'en' ? faq.questionEn : faq.questionAm;
              const answer = language === 'en' ? faq.answerEn : faq.answerAm;
              const isExpanded = expandedId === faq.id;

              return (
                <div key={faq.id} className="card cursor-pointer" onClick={() => toggleFAQ(faq.id)}>
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{question}</p>
                    <span className="text-xl text-red-600">{isExpanded ? '−' : '+'}</span>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-gray-600">
                      {answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 card">
          <h3 className="font-semibold mb-2">
            {language === 'en' ? '📞 Contact Us' : '📞 አግኙን'}
          </h3>
          <p className="text-sm text-gray-600">
            {language === 'en'
              ? 'For immediate support, contact us on Telegram: @AleKirchaAdmin'
              : 'ለፈጣን እርዳታ በቴሌግራም ያግኙን: @AleKirchaAdmin'}
          </p>
        </div>
      </main>
    </div>
  );
}
