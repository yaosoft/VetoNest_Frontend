// src/context/ConsultationRulesContext.js 

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { SiteContext } from './site'; 
// ─── Create Context ────────────────────────────────────────────────────────
const ConsultationRulesContext = createContext(null);

// ─── Hook to use the context ──────────────────────────────────────────────
export const useConsultationRules = () => {
    const context = useContext(ConsultationRulesContext);
    if (!context) {
        throw new Error('useConsultationRules must be used within ConsultationRulesProvider');
    }
    return context;
};

// ─── Provider Component ────────────────────────────────────────────────────
export const ConsultationRulesProvider = ({ children }) => {
	const { base_api_url } = useContext(SiteContext);
    const [rules, setRules] = useState(null);
    const [allTypes, setAllTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('clinic');

    // ─── Fetch all consultation types with their rules ─────────────────────
    const fetchAllTypes = useCallback(async (vetId = null) => {
        setLoading(true);
        setError(null);
        
        try {
            const url = vetId 
                ? `${base_api_url}consultation-rules/types?vetId=${vetId}`
                : `${base_api_url}consultation-rules/types`;
                
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                setAllTypes(data.types);
                // Set default selected type if not already set
                if (data.types.length > 0 && !selectedType) {
                    setSelectedType(data.types[0].type);
                }
                return data.types;
            } else {
                throw new Error(data.message || 'Failed to fetch consultation types');
            }
        } catch (err) {
            setError(err.message);
            message.error('Failed to load consultation rules: ' + err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [selectedType, base_api_url]);

    // ─── Fetch rules for a specific consultation type ─────────────────────
    const fetchRulesForType = useCallback(async (type, vetId = null) => {
        if (!type) return null;
        
        setLoading(true);
        setError(null);
        
        try {
            const url = vetId 
                ? `${base_api_url}consultation-rules/${type}?vetId=${vetId}`
                : `${base_api_url}consultation-rules/${type}`;
                
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                setRules(data.rules);
                setSelectedType(type);
                return data.rules;
            } else {
                throw new Error(data.message || `Failed to fetch rules for ${type}`);
            }
        } catch (err) {
            setError(err.message);
            message.error(`Failed to load rules for ${type}: ` + err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [base_api_url]); 

    // ─── Get rules for a specific type, or the currently selected type ────
    const getCurrentRules = useCallback((type = null) => {
        // If a specific type was requested, look it up directly in allTypes
        // (which holds per-type rules) instead of falling back to whatever
        // was last fetched into `rules`/`selectedType`.
        if (type) {
            const found = allTypes.find(t => t.type === type);
            if (found) return found;
        }

        if (!rules && allTypes.length > 0) {
            const current = allTypes.find(t => t.type === selectedType);
            return current || allTypes[0] || null;
        }
        return rules;
    }, [rules, allTypes, selectedType]);

    // ─── Get a specific rule value ─────────────────────────────────────────
    const getRuleValue = useCallback((key, defaultValue = null) => {
        const currentRules = getCurrentRules();
        if (!currentRules) return defaultValue;
        return currentRules[key] ?? defaultValue;
    }, [getCurrentRules]);

    // ─── Format lead time for display ─────────────────────────────────────
    const formatLeadTime = useCallback((hours) => {
        if (!hours) return 'N/A';
        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            if (remainingHours > 0) {
                return `${days}d ${remainingHours}h`;
            }
            return `${days} day${days > 1 ? 's' : ''}`;
        }
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    }, []);

    // ─── Check if a consultation can be booked at a specific time ─────────
    const canBookAtTime = useCallback((selectedDateTime, type = null) => {
        const rulesToCheck = type ? allTypes.find(t => t.type === type) : getCurrentRules();
        if (!rulesToCheck) return { allowed: false, reason: 'Rules not loaded' };

        const now = new Date();
        const selectedDate = new Date(selectedDateTime);
        const hoursUntilConsultation = (selectedDate - now) / (1000 * 60 * 60);
        
        const minLeadTime = rulesToCheck.min_booking_lead_time_hours || 
                           rulesToCheck.effective_min_booking_lead_time || 
                           24;

        if (hoursUntilConsultation < minLeadTime) {
            return {
                allowed: false,
                reason: `Must book at least ${formatLeadTime(minLeadTime)} in advance`,
                minLeadTime: minLeadTime,
                earliestTime: new Date(now.getTime() + minLeadTime * 60 * 60 * 1000),
            };
        }

        // Check business hours
        const hour = selectedDate.getHours();
        const openingHour = rulesToCheck.opening_hour || 8;
        const closingHour = rulesToCheck.closing_hour || 20;

        if (hour < openingHour || hour >= closingHour) {
            return {
                allowed: false,
                reason: `Consultations must be between ${openingHour}:00 and ${closingHour}:00`,
                openingHour: openingHour,
                closingHour: closingHour,
            };
        }

        // Check available days
        if (rulesToCheck.available_days) {
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayOfWeek = dayNames[selectedDate.getDay()];
            if (!rulesToCheck.available_days.includes(dayOfWeek)) {
                return {
                    allowed: false,
                    reason: `Not available on ${dayOfWeek}`,
                    availableDays: rulesToCheck.available_days,
                };
            }
        }

        return { allowed: true };
    }, [getCurrentRules, allTypes, formatLeadTime]);

    // ─── Get pricing information ──────────────────────────────────────────
    const getPricingInfo = useCallback((type = null) => {
        const rulesToCheck = type ? allTypes.find(t => t.type === type) : getCurrentRules();
        if (!rulesToCheck) return null;

        const multiplier = rulesToCheck.price_multiplier || 1.0;
        const basePrice = rulesToCheck.base_price || 50; // Default base price

        return {
            multiplier: multiplier,
            basePrice: basePrice,
            finalPrice: basePrice * multiplier,
            formattedPrice: rulesToCheck.formatted_price || 
                (multiplier === 1.0 ? 'Standard' : 
                 multiplier > 1 ? `+${Math.round((multiplier - 1) * 100)}%` : 
                 `-${Math.round((1 - multiplier) * 100)}%`),
        };
    }, [getCurrentRules, allTypes]);

    // ─── Get display info for a type ──────────────────────────────────────
    const getTypeDisplayInfo = useCallback((type = null) => {
        const typeToCheck = type || selectedType;
        const found = allTypes.find(t => t.type === typeToCheck);
        if (!found) return null;

        return {
            icon: found.display_icon || '📋',
            name: found.display_name || typeToCheck,
            description: found.description || '',
            color: found.color_hex || '#1890ff',
        };
    }, [allTypes, selectedType]);

    // ─── Get acceptance deadline for a consultation ───────────────────────
    const getAcceptanceDeadline = useCallback((consultationDateTime, type = null) => {
        const rulesToCheck = type ? allTypes.find(t => t.type === type) : getCurrentRules();
        if (!rulesToCheck) return null;

        const consultationDate = new Date(consultationDateTime);
        const leadTimeHours = rulesToCheck.acceptance_lead_time_hours || 24;
        
        const deadline = new Date(consultationDate);
        deadline.setHours(deadline.getHours() - leadTimeHours);
        
        return deadline;
    }, [getCurrentRules, allTypes]);

    // ─── Get earliest booking time ────────────────────────────────────────
    const getEarliestBookingTime = useCallback((type = null) => {
        const rulesToCheck = type ? allTypes.find(t => t.type === type) : getCurrentRules();
        if (!rulesToCheck) return null;

        const now = new Date();
        const minLeadTime = rulesToCheck.min_booking_lead_time_hours || 
                           rulesToCheck.effective_min_booking_lead_time || 
                           24;
        
        const earliest = new Date(now);
        earliest.setHours(earliest.getHours() + minLeadTime);
        
        return earliest;
    }, [getCurrentRules, allTypes]);

    // ─── Context value ──────────────────────────────────────────────────────
    const value = {
        // State
        rules,
        allTypes,
        loading,
        error,
        selectedType,
        
        // Actions
        fetchAllTypes,
        fetchRulesForType,
        setSelectedType,
        
        // Getters
        getCurrentRules,
        getRuleValue,
        getTypeDisplayInfo,
        getPricingInfo,
        getAcceptanceDeadline,
        getEarliestBookingTime,
        
        // Helpers
        formatLeadTime,
        canBookAtTime,
    };

    return (
        <ConsultationRulesContext.Provider value={value}>
            {children}
        </ConsultationRulesContext.Provider>
    );
};

export default ConsultationRulesProvider;