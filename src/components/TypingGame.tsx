"use client";

import React from "react";
import useGameController from "../features/game/hooks/useGameController";
import TypingArea from "../features/game/components/TypingArea";
import TitleScreen from "../features/game/components/TitleScreen";
import GameHeader from "../features/game/components/GameHeader";
import ResultScreen from "../features/result/components/ResultScreen";
import MobileBlocker from "./MobileBlocker";
import SeasonalParticles from "./SeasonalParticles";
import SoundSwitcher from "./SoundSwitcher";
import {
    SeasonalProvider,
    useSeasonalTheme,
} from "../contexts/SeasonalContext";
import { motion, AnimatePresence } from "framer-motion";

function TypingGameInner() {
    const seasonalTheme = useSeasonalTheme();

    const {
        gameState,
        currentWord,
        matchedRomaji,
        pendingInput,
        remainingTarget,
        matchedKana,
        elapsedTime,
        shake,
        ripple,
        startGame,
        quitGame,
        correctKeyCount,
        errorCount,
        maxCombo,
        currentWordIndex,
        totalSentences,
        currentProfile,
        changeProfile,
        availableProfiles,
    } = useGameController();

    return (
        <div
            className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-zen-old-mincho select-none transition-colors duration-1000"
            style={{ backgroundColor: seasonalTheme.adjustedColors.background }}
        >
            {/* Mobile Blocker */}
            <MobileBlocker />

            {/* Time Overlay for atmosphere */}
            <div
                className="fixed inset-0 pointer-events-none z-1 transition-all duration-1000"
                style={{
                    backgroundColor:
                        seasonalTheme.timeTheme.atmosphere.ambientOverlay,
                    mixBlendMode: "overlay",
                }}
            />

            {/* Seasonal Particles */}
            <SeasonalParticles
                emoji={seasonalTheme.atmosphere.particle}
                color={seasonalTheme.atmosphere.particleColor}
            />

            {/* Header */}
            {gameState === "playing" && (
                <GameHeader
                    elapsedTime={elapsedTime}
                    currentWordIndex={currentWordIndex}
                    totalSentences={totalSentences}
                    onQuit={quitGame}
                />
            )}

            {/* Main Game Area */}
            <div className="w-full max-w-5xl px-8 flex flex-col items-center relative z-10">
                <AnimatePresence mode="wait">
                    {/* Waiting State / Intro */}
                    {gameState === "waiting" && (
                        <TitleScreen onStart={startGame} />
                    )}

                    {/* Playing State */}
                    {gameState === "playing" && currentWord && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full"
                        >
                            <TypingArea
                                currentWord={currentWord}
                                matchedRomaji={matchedRomaji}
                                pendingInput={pendingInput}
                                matchedKana={matchedKana}
                                remainingTarget={remainingTarget}
                                shake={shake}
                                ripple={ripple}
                            />
                        </motion.div>
                    )}

                    {/* Finished State */}
                    {gameState === "finished" && (
                        <motion.div
                            key="finished"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full flex justify-center"
                        >
                            <ResultScreen
                                correctKeyCount={correctKeyCount}
                                errorCount={errorCount}
                                maxCombo={maxCombo}
                                duration={elapsedTime}
                                onRestart={quitGame}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Background Ambience */}
            <div
                className={`absolute inset-0 pointer-events-none bg-linear-to-b ${seasonalTheme.atmosphere.gradient} z-0 transition-opacity duration-1000`}
            />

            {/* Sound Switcher */}
            <SoundSwitcher
                currentProfile={currentProfile}
                onProfileChange={changeProfile}
                availableProfiles={availableProfiles}
            />
        </div>
    );
}

export default function TypingGame() {
    return (
        <SeasonalProvider>
            <TypingGameInner />
        </SeasonalProvider>
    );
}
