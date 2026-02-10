import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import { SiteContext } from "../../context/site";

import { ConfigProvider } from 'antd';

import Header from '../Header';
import Footer from '../Footer';
import Title from '../Title';

const Usage = () => {
  const { getAContent } = useContext(SiteContext);

  return (
    <>
      <div className="sticky-stack">
        <Header />
        <Title title={getAContent('cmp_vetonest.com_TermsOfUse_Txt')} />
      </div>
<br/>
      <div className="usage-content" style={{ marginLeft: '70px', marginRight: '20px' }}>
        <h2>{getAContent("cmp_vetonest.com_TermsOfUse_Txt")}</h2>
        <br/>
        <div className="usage-rules">
          <h3>1. Vérification de l’identité professionnelle (obligatoire)</h3>
          <p>
            Désactivation immédiate si le vétérinaire ne fournit pas :<br />
            - Un numéro d’ordre valide ou un justificatif d’exercice (cabinet, clinique, statut légal).<br />
            - Les informations fournies sont fausses, incomplètes ou incohérentes.<br />
            - L’identité ne correspond pas à une personne légalement autorisée à exercer.
          </p>
			<br/>
          <h3>2. Non-respect des rendez-vous</h3>
          <p>
            Avertissement, puis désactivation si répétition :<br />
            - Absences injustifiées répétées.<br />
            - Annulations fréquentes de dernière minute.<br />
            - Retards excessifs et récurrents signalés par les utilisateurs.<br />
            Maximum : plus de 5 incidents confirmés sur 30 jours.
          </p>
			<br/>
          <h3>3. Comportement non professionnel</h3>
          <p>
            Désactivation temporaire ou définitive si :<br />
            - Langage inapproprié ou agressif.<br />
            - Comportement contraire à l’éthique vétérinaire.<br />
            - Manque de respect envers les clients.<br />
            - Refus injustifié de soins après confirmation du RDV.
          </p>
			<br/>
          <h3>4. Avis négatifs graves et vérifiés</h3>
          <p>
            Action si :<br />
            - Plusieurs avis très négatifs concordants.<br />
            - Signalement de négligence grave.<br />
            - Plaintes sérieuses documentées.<br />
            ⚠️ Attention :<br />
            - Pas de désactivation automatique sur un seul avis.<br />
            - Toujours une analyse humaine.
          </p>
			<br/>
          <h3>5. Fraude ou tentative de contournement de VetoNest</h3>
          <p>
            Désactivation immédiate si :<br />
            - Incitation à passer hors plateforme pour éviter la commission.<br />
            - Fausses disponibilités pour capter des clients.<br />
            - Manipulation des avis.<br />
            - Création de faux comptes.<br />
            👉 C’est non négociable pour une marketplace.
          </p>
			<br/>
          <h3>6. Non-paiement des factures VetoNest</h3>
          <p>
            Process :<br />
            1. Relance automatique.<br />
            2. Suspension temporaire du compte après 25 jours.<br />
            3. Désactivation si non-règlement après 40 jours.
          </p>
			<br/>
          <h3>7. Non-respect des règles tarifaires</h3>
          <p>
            Sanction si :<br />
            - Facturation différente sans justification.<br />
            - Pratiques trompeuses envers les utilisateurs.
          </p>
			<br/>
          <h3>8. Utilisation abusive de la plateforme</h3>
          <p>
            Désactivation si :<br />
            - Spam via messagerie.<br />
            - Publicité non autorisée.<br />
            - Usage du compte à des fins non vétérinaires.
          </p>
			<br/>
          <h3>9. Obligation de mise à jour des informations</h3>
          <p>
            Suspension possible si :<br />
            - Informations obsolètes (adresse, horaires, statut).<br />
            - Refus de mise à jour après demande officielle.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
};


export default Usage;
