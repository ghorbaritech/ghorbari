import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WizardStepProps {
    title: string;
    description?: string;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    isFirstStep?: boolean;
    isLastStep?: boolean;
    canNext?: boolean;
    nextLabel?: string;
    children: React.ReactNode;
}

export function WizardStep({
    title,
    description,
    currentStep,
    totalSteps,
    onNext,
    onBack,
    isFirstStep = false,
    isLastStep = false,
    canNext = true,
    nextLabel,
    children
}: WizardStepProps) {
    const progress = ((currentStep) / (totalSteps - 1)) * 100;

    return (
        <div className="w-full max-w-3xl mx-auto px-6 py-8">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    <span>Step {currentStep + 1} of {totalSteps}</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-neutral-100 min-h-[400px] flex flex-col"
            >
                <div className="mb-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-2">{title}</h2>
                    {description && <p className="text-neutral-500 font-medium">{description}</p>}
                </div>

                <div className="flex-1">
                    {children}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-neutral-100">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        disabled={isFirstStep}
                        className={`text-neutral-500 font-bold ${isFirstStep ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    <Button
                        onClick={onNext}
                        disabled={!canNext}
                        className={`rounded-full px-8 h-12 font-bold shadow-lg ${isLastStep
                                ? 'bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white shadow-[#1e3a8a]/30'
                                : 'bg-primary-600 shadow-primary-200'
                            }`}
                    >
                        {nextLabel ? nextLabel : (isLastStep ? 'Complete Booking' : 'Continue')}
                        {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
