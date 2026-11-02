// Broad animal groups shown first in the pet form. The owner must pick one;
// the species (and breed) inside it are optional. Codes match the backend's
// espece.category / carnet_animal.category columns.
export const PET_CATEGORIES = [
	{
		code: 'domestic',
		tagRef: 'cmp_vetonest.com_PetCategory_Domestic',
		fallback: 'Animaux domestiques (chiens, chats…)',
	},
	{
		code: 'nac',
		tagRef: 'cmp_vetonest.com_PetCategory_Nac',
		fallback: 'Nouveaux animaux de compagnie (lapins, oiseaux, reptiles…)',
	},
	{
		code: 'farm',
		tagRef: 'cmp_vetonest.com_PetCategory_Farm',
		fallback: "Animaux d'élevage (vaches, chèvres, cochons…)",
	},
	{
		code: 'equine',
		tagRef: 'cmp_vetonest.com_PetCategory_Equine',
		fallback: 'Équins (chevaux, ânes…)',
	},
];

// 'Unknown' / 'Other' species from before categories existed
export const FALLBACK_ESPECE_IDS = [998, 999];

// getAContent returns '***' (missing key) or '...' (CMS not loaded yet)
// instead of an empty value, so fall back explicitly.
export const contentOr = (getAContent, tagRef, fallback) => {
	const text = tagRef ? getAContent(tagRef) : null;
	return text && text !== '***' && text !== '...' ? text : fallback;
};

export const categoryLabel = (getAContent, code) => {
	const cat = PET_CATEGORIES.find((c) => c.code === code);
	return cat ? contentOr(getAContent, cat.tagRef, cat.fallback) : null;
};

export const speciesLabel = (getAContent, espece) =>
	espece ? contentOr(getAContent, espece.tagRef, espece.description || espece.nom) : null;

// What to call a pet's kind of animal: its species when one was picked,
// otherwise its broad category.
export const petKindLabel = (getAContent, pet, especes = []) => {
	const especeId = pet?.espece?.id;
	if (especeId && !FALLBACK_ESPECE_IDS.includes(Number(especeId))) {
		const esp = especes.find((e) => e.id === especeId) || pet.espece;
		const label = speciesLabel(getAContent, esp);
		if (label) return label;
	}
	return categoryLabel(getAContent, pet?.category || pet?.espece?.category);
};
