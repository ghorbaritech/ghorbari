import { motion } from 'framer-motion';
import { LucideIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---
export interface Option {
    id: string;
    label: string;
    icon?: LucideIcon;
    description?: string;
    image?: string; // For "Vibe" selection
}

// --- Radio Card Group ---
interface RadioCardGroupProps {
    options: Option[];
    selected: string | null;
    onChange: (id: string) => void;
    columns?: 1 | 2 | 3 | 4;
    showCheck?: boolean;
}

export function RadioCardGroup({ options, selected, onChange, columns = 3, showCheck = false }: RadioCardGroupProps) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-4'
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-4`}>
            {options.map((option) => {
                const isSelected = selected === option.id;
                const Icon = option.icon;

                return (
                    <motion.div
                        key={option.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onChange(option.id)}
                        className={cn(
                            "relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 flex flex-col items-center text-center gap-3",
                            isSelected
                                ? "border-primary-600 bg-primary-50/50 shadow-md ring-2 ring-primary-200 ring-offset-2"
                                : "border-neutral-100 bg-white hover:border-sidebar-200 hover:shadow-sm"
                        )}
                    >
                        {isSelected && showCheck && (
                            <div className="absolute top-3 right-3 text-primary-600">
                                <div className="bg-primary-600 text-white rounded-full p-1">
                                    <Check className="w-3 h-3" />
                                </div>
                            </div>
                        )}

                        {option.image ? (
                            <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 relative bg-neutral-100">
                                {/* Placeholder for Next.js Image - simple div for now */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${option.image})` }}
                                />
                                {isSelected && <div className="absolute inset-0 bg-primary-900/10" />}
                            </div>
                        ) : (
                            <div className={cn(
                                "p-3 rounded-full",
                                isSelected ? "bg-primary-100 text-primary-600" : "bg-neutral-100 text-neutral-500"
                            )}>
                                {Icon && <Icon className="w-6 h-6" />}
                            </div>
                        )}

                        <div>
                            <h3 className={cn("font-bold text-sm", isSelected ? "text-primary-900" : "text-neutral-900")}>
                                {option.label}
                            </h3>
                            {option.description && (
                                <p className="text-xs text-neutral-500 mt-1 font-medium">{option.description}</p>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

// --- Checkbox Card Group ---
interface CheckboxCardGroupProps {
    options: Option[];
    selected: string[];
    onChange: (ids: string[]) => void;
    columns?: 1 | 2 | 3;
}

export function CheckboxCardGroup({ options, selected, onChange, columns = 2 }: CheckboxCardGroupProps) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-3'
    };

    const toggle = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter(i => i !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-4`}>
            {options.map((option) => {
                const isSelected = selected.includes(option.id);
                const Icon = option.icon;

                return (
                    <div
                        key={option.id}
                        onClick={() => toggle(option.id)}
                        className={cn(
                            "cursor-pointer rounded-xl border p-4 transition-all duration-200 flex items-center gap-4",
                            isSelected
                                ? "border-primary-600 bg-primary-50/30"
                                : "border-neutral-100 bg-white hover:bg-neutral-50"
                        )}
                    >
                        <div className={cn(
                            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                            isSelected ? "bg-primary-600 border-primary-600 text-white" : "border-neutral-300 bg-white"
                        )}>
                            {isSelected && <Check className="w-3 h-3" />}
                        </div>

                        {Icon && (
                            <div className="text-neutral-500">
                                <Icon className="w-5 h-5" />
                            </div>
                        )}

                        <div className="flex-1">
                            <h3 className={cn("font-bold text-sm", isSelected ? "text-primary-900" : "text-neutral-900")}>
                                {option.label}
                            </h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
