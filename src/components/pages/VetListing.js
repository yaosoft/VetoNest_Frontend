// src/components/VetListing.js

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input, Row, Col, Card, Button, Rate, Skeleton, Tooltip, Tag, Empty, message } from 'antd';
import { 
    SearchOutlined, 
    ProfileOutlined, 
    EnvironmentOutlined,
    UserOutlined
} from '@ant-design/icons';
import { SiteContext } from "../../context/site";
import { AuthContext } from "../../context/AuthProvider";
import Title from '../Title';
import Header from '../Header';
import Footer from '../Footer';
import VetName from '../VetName';
import VerificationStatusBadge from '../VerificationStatusBadge';

const { Meta } = Card;

const ListingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [vetRatings, setVetRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState(false);
  
  const { profileTypeId } = useContext(AuthContext);
  
  const { 
    getAContent, 
    base_url, 
    allSpecialities, 
    setVetos,
    vetos, 
    etablissements,
    getVetRating,
    getVetos,
    setConsultationSelectedVet,
    setCurrentConsultationDate,
    setConsultationTimeslot,
    setCurrentConsultationPet,
  } = useContext(SiteContext);

  const navigate = useNavigate();
  const location = useLocation();

  // ── Fetch vets on mount if not already loaded ────────────────────────────
  useEffect(() => {
    const a = async() => {
      const vetos = await getVetos();
      setVetos(vetos);
    };
    if (!vetos.length) a();
  }, [vetos, getVetos, setVetos]);

  const photoDefaultSrc = '/img/user/1.jpg';
  const etablissementPhotoDefaultSrc = '/img/etablissement/1.jpg';

  // Helper function to get clinic photo URL
  const getClinicPhotoUrl = (item) => {
    if (!item.picture) return etablissementPhotoDefaultSrc;
    if (item.picture.includes('uploads/')) {
      return base_url + item.picture;
    }
    return base_url + 'uploads/files/etablissement/' + item.picture;
  };

  // Helper function to get vet photo URL
  const getVetPhotoUrl = (item) => {
    if (!item.picture) return photoDefaultSrc;
    return base_url + 'uploads/files/profile/' + item.picture;
  };

  // Fetch ratings for all vets
  useEffect(() => {
    const fetchRatings = async () => {
      if (!vetos.length) return;
      
      setLoadingRatings(true);
      const ratings = {};
      
      for (const vet of vetos) {
        try {
          const ratingData = await getVetRating(vet.id);
          if (ratingData && ratingData.success) {
            ratings[vet.id] = {
              average: ratingData.averageRating || 0,
              count: ratingData.ratingCount || 0
            };
          } else {
            ratings[vet.id] = { average: 0, count: 0 };
          }
        } catch (error) {
          console.error(`Error fetching rating for vet ${vet.id}:`, error);
          ratings[vet.id] = { average: 0, count: 0 };
        }
      }
      
      setVetRatings(ratings);
      setLoadingRatings(false);
    };
    
    fetchRatings();
  }, [vetos]);

  // 1. DERIVED DATA: This prevents state-syncing bugs.

  const filteredVets = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const currentName = params.get("searchName");
    const currentValue = params.get("searchValue");

    let results = [];

    if (!vetos.length && !etablissements.length) return [];

    if (currentName === 'location' && currentValue) {
      const targetCity = currentValue.toLowerCase().trim();

      // Filter Vets safely checking the primary location field from Symfony API
      const vList = vetos.filter((v) => {
        if (v.locationCity && typeof v.locationCity === 'string' && v.locationCity.toLowerCase().includes(targetCity)) {
          return true;
        }
        if (v.villes?.includes(currentValue)) return true;
        if (v.city && v.city.toLowerCase().includes(targetCity)) return true;
        
        if (Array.isArray(v.lieu) && v.lieu.length > 0) {
          return v.lieu.some(l => l?.ville?.nom?.toLowerCase().includes(targetCity));
        }
        if (v.lieu?.ville?.nom && v.lieu.ville.nom.toLowerCase().includes(targetCity)) return true;
        if (v.primaryLieu?.ville?.nom && v.primaryLieu.ville.nom.toLowerCase().includes(targetCity)) return true;
        
        return false;
      });

      // Filter Clinics safely
      const eList = etablissements.filter((e) => {
        if (e.villes?.includes(currentValue)) return true;
        if (e.city && e.city.toLowerCase().includes(targetCity)) return true;
        if (e.lieu?.ville?.nom && e.lieu.ville.nom.toLowerCase().includes(targetCity)) return true;
        if (e.etablissement?.lieu?.ville?.nom && e.etablissement.lieu.ville.nom.toLowerCase().includes(targetCity)) return true;
        
        return false;
      });

      results = [...vList, ...eList];
    } 
    else if (currentName === 'vetoSpecialityId') {
      results = vetos.filter((v) => v.vetoSpecialite?.id == currentValue);
    } 
    else if (currentName === 'etablissementTypeId') {
      results = etablissements.filter((e) => e.etablissementType?.id == currentValue);
    } 
    else if (currentName === 'name' && currentValue) {
      const vList = vetos.filter((v) => 
        v.nom?.toLowerCase().includes(currentValue.toLowerCase()) ||
        v.prenom?.toLowerCase().includes(currentValue.toLowerCase())
      );
      const eList = etablissements.filter((e) => 
        e.nom?.toLowerCase().includes(currentValue.toLowerCase())
      );
      results = [...vList, ...eList];
    }
    else {
      results = [...vetos, ...etablissements];
    }

    return results.filter((item) =>
      item.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.prenom && item.prenom.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [vetos, etablissements, location.search, searchQuery]);
  
  // Handle Title
  const displayTitle = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const currentName = params.get("searchName");
    const currentValue = params.get("searchValue");

    if (currentName === 'name') {
      return `${getAContent('cmp_vetonest.com_SearchByName_Ph') || 'Search results for'} - ${currentValue}`;
    }

    if (currentName === 'vetoSpecialityId') {
      const speciality = allSpecialities.find(s => s.id == currentValue);
      if (speciality) {
        return `${getAContent('cmp_vetonest.com_SearchBy_Txt') || 'Search by'} ${getAContent(speciality.tagRef) || speciality.nom}`;
      }
      return getAContent('cmp_vetonest.com_NoVetFound_Txt') || 'No veterinarians found';
    }

    if (currentName === 'etablissementTypeId') {
      if (filteredVets.length > 0 && filteredVets[0].etablissementType) {
        return `${getAContent('cmp_vetonest.com_SearchBy_Txt') || 'Search by'} ${getAContent(filteredVets[0].etablissementType.tagRef) || filteredVets[0].etablissementType.nom}`;
      }
      return getAContent('cmp_vetonest.com_NoEstablishmentFound_Txt') || 'No clinics found';
    }

    if (currentName === 'location') {
      return `${getAContent('cmp_vetonest.com_SearchInCity_Txt') || 'Veterinarians in'} ${currentValue}`;
    }

    return getAContent('cmp_vetonest.com_AllVets_Txt') || 'All Veterinarians';
    
  }, [location.search, filteredVets, allSpecialities, getAContent]);

  // Manage loading state
  useEffect(() => {
    if (vetos.length || etablissements.length) {
      setLoading(false);
    }
  }, [vetos, etablissements]);

  const handleViewProfile = (id) => {
    navigate(`/vet-profile?vetId=${id}`);
  };

  // Updated: Handle consultation booking with vet selection
  const handleBookConsultation = (vet) => {
    // ─── VET PREVENTION ──────────────────────────────────────────
    // Prevent vets from booking consultations (same as VetProfile)
    if (profileTypeId == 2) {
      message.warning(getAContent('cmp_vetonest.com_VetCannotBook_Txt') || 'A vet cannot book a consultation');
      return;
    }
    
    // Set the selected vet in context
    setConsultationSelectedVet(vet);
    
    // Clear any previous consultation state
    setCurrentConsultationDate(null);
    setConsultationTimeslot(null);
    setCurrentConsultationPet(null);
    
    // Navigate to consultation creation
    navigate('/consultation/creation');
  };

  const getVetDisplayRating = (vetId) => {
    const rating = vetRatings[vetId];
    return rating || { average: 0, count: 0 };
  };

  return (
    <>
      <div className="sticky-stack">
        <Header />
        <Title title={displayTitle} />
      </div>

      <div className="listing-page">
        <div className="search-bar" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Input
            placeholder={`${getAContent('cmp_vetonest.com_SearchInList_Ph') || 'Search in list'}...`}
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ width: 350, maxWidth: '90%' }}
            size="large"
          />
        </div>

        <Row gutter={[24, 24]} className="vet-list" key={location.search}>
          {loading ? (
            <Col span={24}>
              <Skeleton active avatar paragraph={{ rows: 3 }} />
              <Skeleton active avatar paragraph={{ rows: 3 }} />
              <Skeleton active avatar paragraph={{ rows: 3 }} />
            </Col>
          ) : filteredVets.length === 0 ? (
            <Col span={24}>
              <Empty 
                description={getAContent('cmp_vetonest.com_NoResultsFound_Txt') || 'No results found'}
                style={{ padding: '60px 0' }}
              />
            </Col>
          ) : (
            filteredVets.map((item) => {
              const isClinic = !!item.creatorProfile;
              const itemKey = isClinic ? `clinic-${item.id}` : `vet-${item.id}`;
              const ratingData = !isClinic ? getVetDisplayRating(item.id) : null;
              const displayName = isClinic 
                ? item.nom 
                : `${item.prenom || ''} ${item.nom}`.trim();
              const specialty = isClinic 
                ? (item.etablissementType?.tagRef 
                    ? getAContent(item.etablissementType.tagRef) 
                    : item.etablissementType?.nom || getAContent('cmp_vetonest.com_Clinic_Txt') || 'Clinic')
                : (item.vetoSpecialite?.tagRef 
                    ? getAContent(item.vetoSpecialite.tagRef) 
                    : item.vetoSpecialite?.nom || getAContent('cmp_vetonest.com_Veterinarian_Txt') || 'Veterinarian');
              
              // Safe UI card text resolution order for locations
              let locationText = '';
              if (item.locationCity) {
                locationText = item.locationCity;
              } else if (item.villes && item.villes.length > 0) {
                locationText = item.villes[0];
              } else if (item.city) {
                locationText = item.city;
              } else if (item.lieu?.ville?.nom) {
                locationText = item.lieu.ville.nom;
              } else if (Array.isArray(item.lieu) && item.lieu[0]?.ville?.nom) {
                locationText = item.lieu[0].ville.nom;
              }
              
              return (
                <Col xs={24} sm={12} md={12} lg={8} xl={6} key={itemKey}>
                  <Card
                    hoverable
                    className="vet-card"
                    style={{
                      border: '1px solid #e8e8e8',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}
                    cover={
                      <div style={{ position: 'relative' }}>
                        <img 
                          alt={displayName} 
                          src={isClinic ? getClinicPhotoUrl(item) : getVetPhotoUrl(item)}
                          style={{ height: 220, objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = isClinic ? etablissementPhotoDefaultSrc : photoDefaultSrc;
                          }}
                        />
                      </div>
                    }
                    actions={
                      isClinic
                        ? [
                            <Button 
                              type="primary"
                              icon={<ProfileOutlined />} 
                              onClick={() => handleViewProfile(item.id)}
                              style={{
                                background: '#52c41a',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                width: 'calc(100% - 32px)',
                                margin: '0 16px',
                                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                              }}
                            >
                              {getAContent('cmp_vetonest.com_LZ4g7ZjhQh') || 'Visit Page'}
                            </Button>
                          ]
                        : [
                            <Button 
                              type="primary"
                              icon={<UserOutlined />} 
                              onClick={() => handleViewProfile(item.id)}
                              style={{
                                background: '#52c41a',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                flex: 1,
                                boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                height: '32px',
                                padding: '0 12px'
                              }}
                            >
                              {getAContent('cmp_vetonest.com_ViewProfile_Btn') || 'Voir profil'}
                            </Button>,
                            // item.bookable is false only for admin-created profiles that
                            // haven't accepted their invitation yet. Undefined defaults to
                            // bookable so this stays backward-compatible until the listing
                            // endpoint's serializer exposes the field.
                            item.bookable === false ? (
                              <Tooltip title={getAContent('cmp_vetonest.com_VetNotClaimedTooltip_Txt') || "Ce vétérinaire n'a pas encore activé son compte"}>
                                <Tag 
                                  style={{ 
                                    flex: 1, 
                                    textAlign: 'center', 
                                    height: '32px', 
                                    lineHeight: '30px', 
                                    borderRadius: '8px',
                                    margin: 0,
                                  }}
                                >
                                  {getAContent('cmp_vetonest.com_ComingSoon_Txt') || 'Bientôt disponible'}
                                </Tag>
                              </Tooltip>
                            ) : (
                              <Button 
                                type="primary"
                                icon={<i className="fa fa-stethoscope" style={{ marginRight: '4px' }} />} 
                                onClick={() => handleBookConsultation(item)}
                                style={{
                                  background: '#FFDE59',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontWeight: 600,
                                  flex: 1,
                                  color: '#333',
                                  boxShadow: '0 2px 8px rgba(255, 222, 89, 0.4)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  height: '32px',
                                padding: '0 12px',
                                fontSize: '13px'
                              }}
                            >
                              {getAContent('cmp_vetonest.com_Ta91Qm72Fs') || 'Consultation'}
                              </Button>
                            )
                          ]
                    }
                  >
                    <Meta
                      title={
                        <Tooltip title={displayName}>
                          <span style={{ fontSize: '16px', fontWeight: 600 }}>
                            {!isClinic ? (
                              <VetName 
                                vet={item}
                                showTitle={true}
                                format="full"
                                withTooltip={false}
                              />
                            ) : (
                              displayName
                            )}
                          </span>
                        </Tooltip>
                      }
                      description={
                        <div style={{ minHeight: '120px' }}>
                          <p style={{ color: '#666', marginBottom: '6px', fontSize: '13px' }}>
                            {specialty}
                          </p>
                          
                          {/* Verification Status Badge */}
                          {!isClinic && (
                            <div style={{ marginBottom: '8px' }}>
                              <VerificationStatusBadge 
                                status={item.verificationStatus}
                                showTooltip={true}
                                showIcon={true}
                                size="small"
                              />
                            </div>
                          )}
                          
                          {!isClinic && ratingData && (
                            <div style={{ marginBottom: '8px', marginTop: '4px' }}>
                              <Rate 
                                disabled 
                                value={ratingData.average} 
                                allowHalf
                                style={{ fontSize: '12px' }}
                              />
                              {ratingData.count > 0 && (
                                <span style={{ marginLeft: '6px', color: '#888', fontSize: '11px' }}>
                                  ({ratingData.count})
                                </span>
                              )}
                              {ratingData.count === 0 && (
                                <span style={{ marginLeft: '6px', color: '#999', fontSize: '11px' }}>
                                  {getAContent('cmp_vetonest.com_NoReviews_Txt') || 'No reviews'}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {locationText && (
                            <p style={{ color: '#888', fontSize: '11px', marginBottom: '0' }}>
                              <EnvironmentOutlined style={{ marginRight: '4px' }} />
                              {locationText}
                            </p>
                          )}
                        </div>
                      }
                    />
                  </Card>
                </Col>
              );
            })
          )}
        </Row>
      </div>
      <Footer />
    </>
  );
};

export default ListingPage;