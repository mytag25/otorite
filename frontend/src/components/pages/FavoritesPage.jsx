import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, BarChart3, Star, Car } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import { favoritesAPI, staticAPI } from '../../services/api';
import useTitle from '../../hooks/useTitle';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { getLocalizedText } = useLanguage();
  useTitle('Favorilerim');
  const { user, toggleFavorite } = useAuth();
  const { addToCompare, isInCompare } = useCompare();

  const [favoriteVehicles, setFavoriteVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [vehicles, brandsData, segmentsData] = await Promise.all([
          favoritesAPI.list(),
          staticAPI.getBrands(),
          staticAPI.getSegments()
        ]);
        setFavoriteVehicles(vehicles);
        setBrands(brandsData);
        setSegments(segmentsData);
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleRemoveFavorite = async (vehicleId) => {
    await toggleFavorite(vehicleId);
    setFavoriteVehicles(favoriteVehicles.filter(v => v.id !== vehicleId));
  };

  const getScoreColor = (score) => {
    const numScore = Number(score);
    if (numScore >= 7.0) return 'text-emerald-400';
    if (numScore >= 4.0) return 'text-orange-400';
    return 'text-red-400';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-3">Giriş Yapın</h2>
          <p className="text-slate-400 mb-6">Favorilerinizi görmek için giriş yapın.</p>
          <Button
            onClick={() => navigate('/login')}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Giriş Yap
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            Favorilerim
          </h1>
          <p className="text-slate-400">{favoriteVehicles.length} araç favorilerde</p>
        </div>

        {favoriteVehicles.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-3">Henüz favori yok</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Beğendiğiniz araçları favorilere ekleyerek burada görebilirsiniz.
            </p>
            <Button
              onClick={() => navigate('/vehicles')}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Car className="w-4 h-4 mr-2" />
              Araçlara Göz At
            </Button>
          </div>
        ) : (
          /* Favorites List */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteVehicles.map(vehicle => {
              const brand = brands.find(b => b.id === vehicle.brand);
              const segment = segments.find(s => s.id === vehicle.segment);
              const overallScore = vehicle.scores?.overall?.score || 0;
              const inCompare = isInCompare(vehicle.id);

              return (
                <div
                  key={vehicle.id}
                  className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden group hover:border-amber-500/30 transition-all duration-300"
                >
                  {/* Image */}
                  <div
                    className="relative aspect-[16/10] overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/vehicles/${vehicle.slug || vehicle.id}`)}
                  >
                    <img
                      src={vehicle.image}
                      alt={`${brand?.name || vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(vehicle.id);
                        }}
                        className="w-9 h-9 rounded-full bg-red-500/80 text-white hover:bg-red-600/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-full">
                        <Star className={`w-4 h-4 ${getScoreColor(overallScore)} fill-current`} />
                        <span className={`font-bold ${getScoreColor(overallScore)}`}>
                          {overallScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-slate-400 text-sm">{brand?.name || vehicle.brand}</p>
                    <h3
                      className="text-white text-xl font-bold cursor-pointer hover:text-amber-500 transition-colors"
                      onClick={() => navigate(`/vehicles/${vehicle.slug || vehicle.id}`)}
                    >
                      {vehicle.model}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4">
                      {vehicle.year} • {segment ? getLocalizedText(segment.name) : vehicle.segment}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addToCompare(vehicle)}
                        className={inCompare
                          ? 'flex-1 bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                          : 'flex-1 text-slate-400 hover:text-white hover:bg-slate-800'
                        }
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        {inCompare ? 'Listede' : 'Karşılaştır'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/vehicles/${vehicle.slug || vehicle.id}`)}
                        className="text-slate-400 hover:text-amber-500 hover:bg-slate-800"
                      >
                        Detay
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
