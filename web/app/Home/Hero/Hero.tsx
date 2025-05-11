import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

const Hero = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    const paths = svg.querySelectorAll('path');
    
    paths.forEach((path) => {
      // Get the length of the path
      const length = path.getTotalLength();
      
      // Set up the starting position
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      
      // Create animation
      path.animate(
        [
          { strokeDashoffset: length },
          { strokeDashoffset: 0 }
        ],
        {
          duration: 3000,
          fill: 'forwards',
          easing: 'ease-in-out',
          delay: Math.random() * 1000
        }
      );
      
      // Pulse animation for filled paths
      path.animate(
        [
          { opacity: 0.7 },
          { opacity: 1 },
          { opacity: 0.7 }
        ],
        {
          duration: 4000,
          iterations: Infinity,
          easing: 'ease-in-out',
          delay: 3000 + Math.random() * 1000
        }
      );
    });
  }, []);
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-blue-900">
      {/* Animated SVG Background */}
      <div className="absolute inset-0 opacity-10">
        <svg 
          ref={svgRef}
          className="w-full h-full scale-150 md:scale-125"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 512 512" 
          version="1.1"
        >
          <path 
            className="fill-blue-500 stroke-blue-300" 
            strokeWidth="2"
            d="M 132.105 119.583 C 120.226 122.777, 107.822 132.499, 102.681 142.642 C 97.154 153.550, 95.694 159.702, 95.716 172 C 95.733 181.704, 96.132 184.635, 98.274 190.766 C 104.316 208.061, 116.126 219.041, 133 223.050 C 140.606 224.857, 156.242 224.645, 162.892 222.645 C 177.533 218.242, 188.328 206.575, 192.636 190.500 C 193.373 187.750, 193.982 185.162, 193.988 184.750 C 193.995 184.338, 187.961 184, 180.579 184 L 167.159 184 166.495 187.024 C 165.573 191.222, 161.340 195.941, 156.541 198.120 C 151.750 200.297, 143.241 200.549, 138.718 198.648 C 124.540 192.690, 119.559 166.405, 129.783 151.500 C 134.894 144.049, 146.689 140.754, 155.329 144.364 C 159.043 145.916, 163.806 151.145, 165.232 155.237 L 166.196 158 180.098 158 C 195.554 158, 194.769 158.469, 192.641 150.500 C 188.594 135.352, 176.496 123.709, 160.465 119.533 C 153.164 117.631, 139.271 117.655, 132.105 119.583 M 199.203 157.250 C 199.509 193.396, 199.586 194.669, 201.813 200.202 C 206.067 210.772, 215.497 218.810, 228.216 222.706 C 236.430 225.223, 251.763 224.916, 260.705 222.055 C 270.867 218.804, 278.419 212.541, 283 203.565 L 286.500 196.707 286.795 158.354 L 287.089 120 274.104 120 L 261.118 120 260.809 154.750 C 260.506 188.870, 260.459 189.566, 258.231 193.149 C 252.165 202.903, 233.642 202.038, 228.988 191.784 C 227.187 187.815, 227.042 185.015, 227.022 153.750 L 227 120 212.944 120 L 198.888 120 199.203 157.250 M 413.762 196.205 C 403.964 203.018, 386.288 215.718, 357.500 236.627 C 344.850 245.815, 331.575 255.358, 328 257.834 C 320.644 262.928, 317 265.998, 317 267.103 C 317 268.515, 320.053 270.917, 321.279 270.469 C 321.951 270.224, 325.425 269.590, 329 269.061 C 332.575 268.532, 337.975 267.653, 341 267.107 C 363.893 262.975, 370.736 261.938, 373.370 262.200 C 376.309 262.492, 376.429 262.717, 378.093 271 C 380.836 284.659, 385.034 304.352, 385.607 306.250 C 385.915 307.271, 387.115 308, 388.486 308 C 391.028 308, 391.586 306.669, 397.499 286.500 C 400.518 276.200, 407.966 252.377, 415.006 230.500 C 425.117 199.078, 426.102 195.718, 425.805 193.638 C 425.270 189.888, 421.776 190.632, 413.762 196.205 M 339.373 206.979 C 300.089 217.278, 276.823 261.312, 290.121 300.195 C 293.098 308.899, 295.991 314.420, 301.477 321.866 C 304.094 325.419, 305.787 328.613, 305.307 329.093 C 304.834 329.566, 298.287 333.113, 290.757 336.976 L 277.066 344 217.733 344 C 172.918 344, 158.106 344.294, 157.200 345.200 C 155.211 347.189, 155.774 351.728, 158.223 353.443 C 160.153 354.795, 166.274 355, 204.806 355 C 239.832 355, 249.079 355.263, 248.750 356.249 C 248.521 356.936, 242.125 360.311, 234.537 363.749 L 220.740 370 174.620 370.015 C 139.537 370.026, 127.902 370.331, 126 371.290 C 123.181 372.711, 122.338 375.894, 123.972 378.948 C 125.046 380.954, 125.813 381, 158.535 381 C 187.615 381, 192 381.197, 192 382.500 C 192 383.325, 191.576 384, 191.058 384 C 190.541 384, 182.328 387.335, 172.808 391.411 C 159.356 397.170, 155.500 399.231, 155.500 400.661 C 155.500 402.409, 157.104 402.499, 188 402.477 C 229.459 402.448, 251.996 400.221, 284 392.990 C 297.559 389.926, 316.034 383.959, 333.793 376.906 C 367.352 363.580, 404.364 339.173, 417.688 321.585 C 433.925 300.151, 436.938 267.550, 424.790 244.757 C 423.102 241.591, 421.371 239, 420.943 239 C 420.515 239, 419.009 242.488, 417.598 246.750 C 415.115 254.249, 415.084 254.646, 416.647 259 C 418.831 265.086, 419.592 282.403, 418.020 290.272 C 413.953 310.643, 398.646 327.582, 377.989 334.571 C 372.073 336.572, 368.832 337, 359.586 337 C 346.755 337, 341.064 335.662, 330.500 330.164 C 322.349 325.921, 311.803 315.927, 307.640 308.500 C 301.944 298.338, 299.695 289.560, 299.695 277.500 C 299.695 268.153, 300.103 265.304, 302.411 258.538 C 307.798 242.751, 318.066 230.975, 332.500 224.029 C 341.944 219.485, 351.683 217.569, 362.049 218.218 L 369.500 218.684 375.769 214.277 C 379.217 211.854, 381.800 209.485, 381.508 209.013 C 381.217 208.541, 377.857 207.445, 374.042 206.578 C 364.527 204.414, 348.447 204.600, 339.373 206.979 M 100 277 L 100 328 112.984 328 L 125.968 328 126.234 300.250 L 126.500 272.500 134.687 285 C 139.190 291.875, 147.515 304.346, 153.187 312.713 L 163.500 327.925 177.750 327.963 L 192 328 192 277 L 192 226 179 226 L 166 226 166 255.500 C 166 271.725, 165.662 284.986, 165.250 284.970 C 164.838 284.953, 162.267 281.466, 159.539 277.220 C 156.810 272.974, 148.112 259.712, 140.210 247.750 L 125.843 226 112.921 226 L 100 226 100 277 M 198.006 226.750 C 198.010 227.162, 198.610 228.625, 199.341 230 C 219.076 267.144, 228.692 285.082, 230.165 287.500 C 231.763 290.123, 231.993 292.856, 231.996 309.250 L 232 328 245 328 L 258 328 258 308.494 L 258 288.988 273.500 258 C 282.025 240.957, 289 226.772, 289 226.477 C 289 226.183, 283.114 226.068, 275.921 226.221 L 262.842 226.500 254.248 245.750 C 249.522 256.337, 245.395 264.984, 245.077 264.963 C 244.760 264.943, 240.697 256.731, 236.049 246.713 C 231.400 236.696, 227.183 227.938, 226.676 227.250 C 225.656 225.865, 197.995 225.383, 198.006 226.750 M 363.835 274.498 C 363.562 274.772, 358.199 276.519, 351.919 278.382 C 342.202 281.263, 326.384 287.026, 323.784 288.634 C 322.924 289.165, 328.858 294.527, 336.563 300.181 C 342.950 304.867, 355.649 311.248, 363.915 313.923 C 371.957 316.527, 374.324 316.607, 373.589 314.250 C 373.289 313.288, 372.607 309.575, 372.074 306 C 371.134 299.708, 368.599 283.893, 367.464 277.250 C 366.973 274.372, 365.260 273.073, 363.835 274.498" 
            stroke="none" 
            fillRule="evenodd"
          />
        </svg>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-400 opacity-20"
            style={{
              width: `${Math.random() * 8 + 2}px`,
              height: `${Math.random() * 8 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Content Container */}
      <div className="relative flex flex-col items-center justify-center w-full h-full px-4 text-center z-10">
        <div className="p-4 md:p-6 backdrop-blur-md bg-white/10 rounded-xl shadow-2xl border border-white/20 w-full max-w-sm md:max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            CS Events Spotlight
          </h1>
          
          <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8">
            A one-stop platform to showcase and highlight events and projects ongoing in the CS Department.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
            <Link className='w-full' href="/events">
              <button className="px-6 w-full md:px-8 py-2 md:py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/50">
                Explore Events
              </button>
            </Link>
            <Link className='w-full' href="/dashboard/projects/new">
              <button className="px-6 w-full md:px-8 py-2 md:py-3 bg-transparent border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-all">
                Submit Project
              </button>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-10 animate-bounce hidden md:block">
          <svg className="w-6 h-6 text-white/70" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
      
      {/* Animation keyframes for floating particles */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
          }
        }
        
        @media (max-width: 768px) {
          @keyframes float {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            10% {
              opacity: 0.2;
            }
            90% {
              opacity: 0.2;
            }
            100% {
              transform: translateY(-50vh) translateX(${Math.random() * 50 - 25}px);
              opacity: 0;
            }
          }
        }
      `}</style>
    </div>
  );
};

export default Hero;