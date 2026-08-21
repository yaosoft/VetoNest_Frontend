import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import Title from "../Title";

const TermsOfUse = () => {
  return (
    <>
      <style>
        {`
          .cgu-content p {
            margin-bottom: 1.2em;
          }
          .cgu-content h2 {
            margin-top: 1.5em;
            margin-bottom: 0.8em;
          }
          .cgu-content h3 {
            margin-top: 1.2em;
            margin-bottom: 0.6em;
          }
        `}
      </style>
      <div className="sticky-stack">
        <Header />
        <Title title="Conditions Générales d'Utilisation - VetoNest" />
      </div>
      <br />
      <div className="cgu-content" style={{ marginLeft: "70px", marginRight: "20px" }}>
        <p><strong>229 Rue Saint Honoré - 75001 Paris</strong></p>

        <h2>1. Objet</h2>
        <p>Les présentes CGU encadrent l'accès et l'utilisation de la plateforme VetoNest.</p>

        <h2>2. Description du service</h2>
        <p>
          VetoNest est une plateforme permettant :<br />
          - l'accès à des informations sur les symptômes des animaux via intelligence artificielle<br />
          - la mise en relation entre propriétaires d'animaux et professionnels vétérinaires
        </p>

        <h2>3. Nature des informations fournies</h2>
        <p>Les informations fournies par VetoNest sont indicatives et ne constituent pas un diagnostic vétérinaire.</p>

        <h2>4. Responsabilité</h2>
        <p>L'utilisateur reconnaît que l'utilisation du service ne remplace pas une consultation vétérinaire.</p>

        <h2>5. Accès des professionnels vétérinaires</h2>
        <p>L'accès à la plateforme en tant que professionnel est soumis à validation préalable.</p>

        <h3>5.1 Vérification de l'identité professionnelle</h3>
        <p>
          Le professionnel doit fournir :<br />
          - un numéro d'ordre valide ou justificatif d'exercice<br />
          - des informations exactes et complètes<br />
          VetoNest se réserve le droit de refuser ou suspendre tout compte en cas d'informations incorrectes ou non vérifiables.
        </p>

        <h2>6. Obligations des professionnels</h2>
        <p>Le professionnel s'engage à adopter un comportement conforme aux standards de la profession.</p>

        <h3>6.1 Respect des rendez-vous</h3>
        <p>
          Des sanctions peuvent être appliquées en cas de :<br />
          - absences répétées<br />
          - annulations fréquentes<br />
          - retards excessifs<br />
          Un seuil de 5 incidents confirmés sur 30 jours peut entraîner une suspension.
        </p>

        <h3>6.2 Comportement professionnel</h3>
        <p>
          Tout comportement inapproprié peut entraîner une suspension ou désactivation du compte, notamment :<br />
          - langage agressif<br />
          - manque de respect<br />
          - non-respect de l'éthique professionnelle
        </p>

        <h3>6.3 Avis utilisateurs</h3>
        <p>Les avis sont analysés avant toute sanction. Aucune désactivation automatique n'est appliquée sur un seul avis.</p>

        <h3>6.4 Fraude et contournement</h3>
        <p>
          Sont strictement interdits :<br />
          - contournement de la plateforme<br />
          - manipulation des avis<br />
          - faux comptes<br />
          Toute violation entraîne une désactivation immédiate.
        </p>

        <h3>6.5 Paiement des services</h3>
        <p>
          En cas de non-paiement :<br />
          - relance automatique<br />
          - suspension après 25 jours<br />
          - désactivation après 40 jours
        </p>

        <h3>6.6 Transparence tarifaire</h3>
        <p>Le professionnel s'engage à respecter les tarifs annoncés.</p>

        <h3>6.7 Utilisation de la plateforme</h3>
        <p>Toute utilisation abusive (spam, publicité non autorisée) est interdite.</p>

        <h3>6.8 Mise à jour des informations</h3>
        <p>Le professionnel doit maintenir ses informations à jour.</p>

        <h2>7. Suspension et résiliation</h2>
        <p>VetoNest se réserve le droit de suspendre ou supprimer tout compte ne respectant pas les présentes CGU.</p>

        <h2>8. Données personnelles</h2>
        <p>Les données sont traitées conformément à la réglementation européenne (RGPD).</p>

        <h2>9. Modification des CGU</h2>
        <p>VetoNest peut modifier les CGU à tout moment.</p>

        <h2>10. Droit applicable</h2>
        <p>Les présentes CGU sont soumises aux réglementations européennes applicables.</p>

        <p style={{ fontStyle: "italic", marginTop: "20px" }}>
          VetoNest agit en tant qu'intermédiaire technique et ne saurait être tenu responsable de la relation contractuelle entre l'utilisateur et le professionnel.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default TermsOfUse;