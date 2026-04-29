import { useEffect, useState } from "react";
import api from "../../api/axios.api.js";

export default function DietChart() {
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchDiet = async () => {
      try {
        const res = await api.get("/user/diet/my");
        setDiet(res.data.data);
      } catch (err) {
        console.error("Failed to load diet:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiet();
  }, []);

  useEffect(() => {
    if (!diet?.photos) return;
    
    const images = diet.photos.filter(photo => !isPdf(photo.photo));
    if (images.length === 0) return;

    const indicesToPreload = [
      currentIndex,
      (currentIndex + 1) % images.length,
      (currentIndex - 1 + images.length) % images.length
    ];

    indicesToPreload.forEach(index => {
      if (!loadedImages[index]) {
        const img = new Image();
        img.src = images[index].photo;
        img.onload = () => {
          setLoadedImages(prev => ({ ...prev, [index]: true }));
        };
      }
    });
  }, [currentIndex, diet?.photos, loadedImages]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      nextImage();
    }
    if (diff < -50) {
      prevImage();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const nextImage = () => {
    if (!diet?.photos || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevImage = () => {
    if (!diet?.photos || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!diet || !diet.photos || diet.photos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🥗</div>
          <h2 className="text-xl font-bold text-white mb-2">
            No Diet Plan Yet
          </h2>
          <p className="text-neutral-400 text-sm">
            Your admin hasn't uploaded a diet plan yet.
          </p>
        </div>
      </div>
    );
  }

  const isPdf = (url) =>
    url?.toLowerCase().includes(".pdf") ||
    url?.toLowerCase().includes("pdf");

  const getPdfUrl = (url) => {
    if (!url) return url;
    return url.replace("/upload/", "/upload/fl_inline/");
  };

  const images = diet.photos.filter(photo => !isPdf(photo.photo));
  const pdfs = diet.photos.filter(photo => isPdf(photo.photo));

  if (images.length === 0 && pdfs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-white mb-2">
            No Valid Files
          </h2>
          <p className="text-neutral-400 text-sm">
            No images or PDFs available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Diet Plan</h1>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`w-2 h-2 rounded-full ${
                diet.status === "approved"
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            />
            <span
              className={`text-sm capitalize ${
                diet.status === "approved"
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {diet.status}
            </span>
          </div>
        </div>


        {images.length > 0 && (
          <div className="mb-6">
            <div 
              className="relative rounded-xl overflow-hidden bg-neutral-900/50"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative flex items-center justify-center min-h-[50vh] md:min-h-[70vh]">
                {!loadedImages[currentIndex] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-red-600 rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={images[currentIndex].photo}
                  alt={`Diet plan ${currentIndex + 1}`}
                  className={`w-full h-auto max-h-[70vh] object-contain rounded-xl cursor-pointer transition-opacity duration-300 ${
                    loadedImages[currentIndex] ? "opacity-100" : "opacity-0"
                  }`}
                  onClick={() => window.open(images[currentIndex].photo, "_blank")}
                  onLoad={() => {
                    setLoadedImages(prev => ({ ...prev, [currentIndex]: true }));
                  }}
                />
              </div>

              {/* Navigation Arrows - Desktop */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    disabled={isTransitioning}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-all hidden md:block disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    disabled={isTransitioning}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-all hidden md:block disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!isTransitioning) {
                          setIsTransitioning(true);
                          setCurrentIndex(idx);
                          setTimeout(() => setIsTransitioning(false), 300);
                        }
                      }}
                      className={`transition-all h-2 rounded-full ${
                        idx === currentIndex
                          ? "w-6 bg-red-600"
                          : "w-2 bg-white/50 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
              <p className="text-center text-neutral-500 text-xs mt-3">
                {currentIndex + 1} / {images.length}
              </p>
            )}
          </div>
        )}

        {/* PDF Files Section */}
        {pdfs.length > 0 && (
          <div className={images.length > 0 ? "mt-8" : ""}>
            <h2 className="text-white text-lg font-semibold mb-3">Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pdfs.map((pdf, index) => {
                const url = pdf.photo;
                return (
                  <a
                    key={index}
                    href={getPdfUrl(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-neutral-800 border border-white/10 rounded-xl overflow-hidden hover:border-red-600/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between p-4 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                          📄
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">
                            PDF Document {index + 1}
                          </p>
                          <p className="text-neutral-400 text-xs">
                            Tap to open
                          </p>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-center text-neutral-600 text-xs mt-8">
          Last updated:{" "}
          {new Date(diet.updatedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}