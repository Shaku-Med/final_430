'use client'
import React, { useEffect, useState } from 'react';
import Logo from '../Home/Icons/Logo';
import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const Load = () => {
    const [isFlickering, setIsFlickering] = useState(true);
    
    useEffect(() => {
        const flickerInterval = setInterval(() => {
            setIsFlickering(prev => !prev);
        }, 400);
        
        return () => clearInterval(flickerInterval);
    }, []);

    return (
        <>
            <div className="load_ui fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
                <div className="loader">
                    <div className="orbe" style={{ '--index': 0 }}></div>
                    <div className="orbe" style={{ '--index': 1 }}></div>
                    <div className="orbe" style={{ '--index': 2 }}></div>
                    <div className="orbe" style={{ '--index': 3 }}></div>
                    <div className="orbe" style={{ '--index': 4 }}></div>
                </div>
                
                <motion.div
                    className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                        scale: 1, 
                        opacity: 1
                    }}
                    transition={{ 
                        duration: 0.8,
                        ease: "easeOut"
                    }}
                >
                    <Logo svgClassName="w-36 text-muted-foreground" pathClassName="fill-foreground"/>
                </motion.div>
                
                <motion.div 
                    className="flex items-center gap-1 fixed bottom-5 left-0 w-full h-12 z-50 justify-center text-foreground font-bold"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <span className="line-clamp-1 font-bold text-2xl text-foreground">SpotLight</span>
                    <motion.span
                        animate={{ 
                            opacity: isFlickering ? 1 : 0.2
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <Lightbulb 
                            size={20} 
                            fill={isFlickering ? "yellow" : "none"}
                            color={isFlickering ? "yellow" : "currentColor"}
                        />
                    </motion.span>
                </motion.div>
            </div>
        </>
    );
}

export default Load;