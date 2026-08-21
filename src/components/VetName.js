// src/components/VetName.js
import React, { useContext } from 'react';
import { Tooltip } from 'antd';
import { SiteContext } from '../context/site';

// getAContent() can return special sentinel strings instead of real content:
// '...' while the translation table is still loading, '***' when the tag
// wasn't found (or has no content yet). Both used to leak straight into the
// UI in a few spots here because each check was written slightly differently.
// Centralizing it in one place means every consumer treats them the same way.
const isPlaceholderContent = (value) => {
    return !value ||
        value === '...' ||
        value === '***' ||
        (typeof value === 'string' && value.includes('undefined'));
};

const VetName = ({ 
    vet,           
    showTitle = true,     
    showFirstName = true, 
    showLastName = true,  
    showFullName = false, 
    format = 'full',      
    className = '',
    withTooltip = false,  
    linkToProfile = false, 
    userId = null,
    id = null,
}) => {
    const { getAContent } = useContext(SiteContext);

    // Helper to get the display name based on format
    // Inside VetName component
	const getDisplayName = () => {
		if (!vet) return '';

		let titleCode = '';
		if (showTitle && vet.vetTitle) {
			const { tagRefCode, code, id: vetTitleId } = vet.vetTitle;

			// 1. Try translation via tagRefCode
			if (tagRefCode) {
				const translated = getAContent(tagRefCode);
				// Consider translation valid only if it's not a placeholder/sentinel
				// (still loading or not found) or the tag key itself
				const isValid = !isPlaceholderContent(translated) && translated !== tagRefCode;
				if (isValid) {
					titleCode = translated;
				}
			}

			// 2. Fallback to the raw code (e.g., "Dr", "Prof")
			if (!titleCode && code) {
				titleCode = code;
			}

			// 3. Hardcoded fallback for known IDs (add more as needed)
			if (!titleCode) {
				const titleMap = {
					1: 'Dr',
					2: 'Prof',
					3: 'Pr',
					// extend based on your database
				};
				titleCode = titleMap[vetTitleId] || '';
			}
		}

		// Build first/last name
		const firstName = showFirstName ? (vet.prenom || '') : '';
		const lastName = showLastName ? (vet.nom || '') : '';

		// Assemble result based on format
		let fullName = '';
		if (format === 'short') {
			const firstInitial = firstName ? `${firstName.charAt(0)}.` : '';
			const shortLastName = lastName ? lastName.split(' ')[0] : '';
			fullName = `${firstInitial} ${shortLastName}`.trim();
		} else if (format === 'initials') {
			const initial1 = firstName ? firstName.charAt(0) : '';
			const initial2 = lastName ? lastName.charAt(0) : '';
			fullName = `${initial1}${initial2}`.toUpperCase();
		} else { // 'full' (default)
			const space = (firstName && lastName) ? ' ' : '';
			fullName = `${firstName}${space}${lastName}`.trim();
		}

		// Combine title and name
		const result = titleCode ? `${titleCode} ${fullName}` : fullName;
		return result.trim() || 'Vétérinaire';
	};

    // Get full name for tooltip
    const getFullName = () => {
        let titleCode = '';
        if (vet.vetTitle) {
            if (vet.vetTitle.tagRefCode) {
                const translated = getAContent(vet.vetTitle.tagRefCode);
                if (!isPlaceholderContent(translated)) {
                    titleCode = translated;
                }
            }
            if (!titleCode && vet.vetTitle.code) {
                titleCode = vet.vetTitle.code;
            }
        }
        const title = titleCode ? `${titleCode} ` : '';
        return `${title}${vet.prenom || ''} ${vet.nom || ''}`.trim();
    };

    // Get tooltip content with translated labels
    const getTooltipContent = () => {
        if (!withTooltip) return null;
        
        let titleLabel = '';
        let titleDescription = '';
        
        if (vet.vetTitle) {
            if (vet.vetTitle.tagRefLabel) {
                const label = getAContent(vet.vetTitle.tagRefLabel);
                titleLabel = isPlaceholderContent(label) ? '' : label;
            }
            if (vet.vetTitle.tagRefDescription) {
                const description = getAContent(vet.vetTitle.tagRefDescription);
                titleDescription = isPlaceholderContent(description) ? '' : description;
            }
        }
        
        return (
            <div>
                <strong>{getFullName()}</strong>
                {titleLabel && (
                    <div className="small">
                        {titleLabel}
                    </div>
                )}
                {titleDescription && (
                    <div className="small text-muted">
                        {titleDescription}
                    </div>
                )}
                {vet.vetoSpecialite?.tagRef && (() => {
                    // NOTE: this used to be `getAContent(...) || vet.vetoSpecialite.name`.
                    // '***' is a non-empty string, so it's truthy — the fallback to
                    // vet.vetoSpecialite.name never actually ran, and the literal
                    // '***' got rendered to the user instead.
                    const specialiteLabel = getAContent(vet.vetoSpecialite.tagRef);
                    return (
                        <div className="small">
                            {isPlaceholderContent(specialiteLabel) ? vet.vetoSpecialite.name : specialiteLabel}
                        </div>
                    );
                })()}
            </div>
        );
    };

    const displayName = getDisplayName();
    
    if (!displayName || displayName === 'Vétérinaire' || displayName === '...') {
        // Try to build a fallback name from prenom and nom
        const fallback = `${vet.prenom || ''} ${vet.nom || ''}`.trim();
        if (fallback) return <span className={className}>{fallback}</span>;
        return <span className={className}>Vétérinaire</span>;
    }
    
    if (linkToProfile && vet.id) {
        const profileUrl = `/profile-vet/${vet.id}`;
        
        return (
            <Tooltip title={getTooltipContent()} placement="top" mouseEnterDelay={0.5}>
                <a 
                    href={profileUrl}
                    className={`vet-name-link ${className}`}
                    style={{ cursor: 'pointer', textDecoration: 'none' }}
                    onClick={(e) => {
                        e.preventDefault();
                        if (window.navigate) {
                            window.navigate(profileUrl);
                        } else {
                            window.location.href = profileUrl;
                        }
                    }}
                >
                    {displayName}
                </a>
            </Tooltip>
        );
    }
    
    return (
        <Tooltip title={getTooltipContent()} placement="top" mouseEnterDelay={0.5}>
            <span className={`vet-name ${className}`}>
                {displayName}
            </span>
        </Tooltip>
    );
};

export const VetNameCompact = ({ vet, showTitle = true }) => {
    return (
        <VetName 
            vet={vet}
            showTitle={showTitle}
            format="short"
            withTooltip={true}
        />
    );
};

export const VetInitials = ({ vet, showTitle = false }) => {
    const getInitials = () => {
        if (!vet) return '?';
        let initials = '';
        if (vet.prenom) initials += vet.prenom.charAt(0);
        if (vet.nom) initials += vet.nom.charAt(0);
        return initials.toUpperCase() || 'V';
    };
    
    return (
        <div className="vet-initials-avatar" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#FFDE59',
            color: '#000',
            fontWeight: 'bold'
        }}>
            {getInitials()}
        </div>
    );
};

export default VetName;