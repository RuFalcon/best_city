import React, { useEffect, useState } from 'react';
import { Building2, MapPin } from 'lucide-react';
import { supabase } from './lib/supabase';

type City = 'moscow' | 'saint-petersburg';

interface VoteCount {
  moscow: number;
  'saint-petersburg': number;
}

function App() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [voteCounts, setVoteCounts] = useState<VoteCount>({
    moscow: 0,
    'saint-petersburg': 0
  });
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    // Initial vote count
    fetchVoteCounts();

    // Subscribe to changes
    const channel = supabase
      .channel('votes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => {
          fetchVoteCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVoteCounts = async () => {
    const { data: moscowCount } = await supabase
      .from('votes')
      .select('id', { count: 'exact' })
      .eq('city', 'moscow');

    const { data: saintPetersburgCount } = await supabase
      .from('votes')
      .select('id', { count: 'exact' })
      .eq('city', 'saint-petersburg');

    setVoteCounts({
      moscow: moscowCount?.length || 0,
      'saint-petersburg': saintPetersburgCount?.length || 0
    });
  };

  const handleVote = async (city: City) => {
    setIsVoting(true);
    setSelectedCity(city);

    try {
      await supabase.from('votes').insert([{ city }]);
      await fetchVoteCounts();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes = voteCounts.moscow + voteCounts['saint-petersburg'];
  const getPercentage = (votes: number) => 
    totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Какой город лучше?
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Moscow Card */}
          <div 
            className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ${
              selectedCity === 'moscow' ? 'ring-4 ring-blue-400' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Москва</h2>
              <Building2 className="w-8 h-8 text-red-500" />
            </div>
            <img
              src="https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=800"
              alt="Moscow"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <div className="mb-4">
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-red-500 rounded-full h-4 transition-all duration-500"
                  style={{ width: `${getPercentage(voteCounts.moscow)}%` }}
                ></div>
              </div>
              <p className="text-center mt-2 text-lg font-semibold">
                {getPercentage(voteCounts.moscow)}% ({voteCounts.moscow} голосов)
              </p>
            </div>
            <button
              onClick={() => handleVote('moscow')}
              disabled={isVoting}
              className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isVoting && selectedCity === 'moscow' ? 'Голосование...' : 'Голосовать за Москву'}
            </button>
          </div>

          {/* Saint Petersburg Card */}
          <div 
            className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ${
              selectedCity === 'saint-petersburg' ? 'ring-4 ring-blue-400' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Санкт-Петербург</h2>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
            <img
              src="https://images.unsplash.com/photo-1556610961-2fecc5927173?auto=format&fit=crop&w=800"
              alt="Saint Petersburg"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <div className="mb-4">
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 rounded-full h-4 transition-all duration-500"
                  style={{ width: `${getPercentage(voteCounts['saint-petersburg'])}%` }}
                ></div>
              </div>
              <p className="text-center mt-2 text-lg font-semibold">
                {getPercentage(voteCounts['saint-petersburg'])}% ({voteCounts['saint-petersburg']} голосов)
              </p>
            </div>
            <button
              onClick={() => handleVote('saint-petersburg')}
              disabled={isVoting}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isVoting && selectedCity === 'saint-petersburg' ? 'Голосование...' : 'Голосовать за Санкт-Петербург'}
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-600">
          Всего голосов: {totalVotes}
        </p>
      </div>
    </div>
  );
}

export default App;