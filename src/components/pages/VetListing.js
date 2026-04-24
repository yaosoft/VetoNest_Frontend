import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input, Row, Col, Card, Button, Rate, Skeleton, Tooltip } from 'antd';
import { SearchOutlined, CalendarOutlined, ProfileOutlined, StarOutlined } from '@ant-design/icons';
import { SiteContext } from "../../context/site";
import Title from '../Title';
import Header from '../Header';
import Footer from '../Footer';

const { Meta } = Card;

const ListingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [vetRatings, setVetRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState(false);
  
  const { 
    getAContent, 
    base_url, 
    allSpecialities, 
    vetos, 
    etablissements,
    getVetRating,
    base_api_url,
    getVetos,
  } = useContext(SiteContext);

  const navigate = useNavigate();
  const location = useLocation();

  // ── Fetch vets on mount if not already loaded ────────────────────────────
  useEffect(() => {
    if (!vetos.length) getVetos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const photoDefaultSrc = '/img/user/1.jpg';
  const etablissementPhotoDefaultSrc = '/img/etablissement/1.jpg';

  // Fetch ratings for all vets
  // Fetch ratings for all vets - with better error handling
	useEffect(() => {
	  const fetchRatings = async () => {
		if (!vetos.length) return;
		
		setLoadingRatings(true);
		const ratings = {};
		
		// Fetch ratings one by one to avoid overwhelming the server
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

    // Safety check for data load
    if (!vetos.length && !etablissements.length) return [];

    if (currentName === 'location' && currentValue) {
      // Filter both lists by city
      const vList = vetos.filter((v) => v.villes?.includes(currentValue));
      const eList = etablissements.filter((e) => e.villes?.includes(currentValue));
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

    // Filter by the secondary search bar ("Search in list")
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

    // Case 1: Search by Name (Vet or Clinic)
    if (currentName === 'name') {
      return `${getAContent('cmp_vetonest.com_SearchByName_Ph') || 'Search results for'} - ${currentValue}`;
    }

    // Case 2: Search by Veto Speciality
    if (currentName === 'vetoSpecialityId') {
      const speciality = allSpecialities.find(s => s.id == currentValue);
      if (speciality) {
        return `${getAContent('cmp_vetonest.com_SearchBy_Txt') || 'Search by'} ${getAContent(speciality.tagRef) || speciality.nom}`;
      }
      return getAContent('cmp_vetonest.com_NoVetFound_Txt') || 'No veterinarians found';
    }

    // Case 3: Search by Clinic (Etablissement) Type
    if (currentName === 'etablissementTypeId') {
      if (filteredVets.length > 0 && filteredVets[0].etablissementType) {
        return `${getAContent('cmp_vetonest.com_SearchBy_Txt') || 'Search by'} ${getAContent(filteredVets[0].etablissementType.tagRef) || filteredVets[0].etablissementType.nom}`;
      }
      return getAContent('cmp_vetonest.com_NoEstablishmentFound_Txt') || 'No clinics found';
    }

    // Case 4: Search by Location (City)
    if (currentName === 'location') {
      return `${getAContent('cmp_vetonest.com_SearchInCity_Txt') || 'Veterinarians in'} ${currentValue}`;
    }

    // Case 5: Default (All Vets)
    return getAContent('cmp_vetonest.com_AllVets_Txt') || 'All Veterinarians';
    
  }, [location.search, filteredVets, allSpecialities, getAContent]);

  // Manage loading state
  useEffect(() => {
    if (vetos.length || etablissements.length) {
      setLoading(false);
    }
  }, [vetos, etablissements]);

  const handleGetAppointment = (id, type) => {
    if (type === 'vet') {
      navigate(`/vet-profile?vetId=${id}`);
    } else {
      navigate(`/etablissement?etablissementId=${id}`);
    }
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
        <div className="search-bar">
          <Input
            placeholder={`${getAContent('cmp_vetonest.com_SearchInList_Ph') || 'Search in list'}...`}
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ width: 300, marginBottom: '20px' }}
          />
        </div>

        <Row gutter={[16, 16]} className="vet-list" key={location.search}>
          {loading ? (
            <Col span={24}><Skeleton active /></Col>
          ) : filteredVets.length === 0 ? (
            <Col span={24}>
              <div style={{ textAlign: 'center', padding: '60px' }}>
                {getAContent('cmp_vetonest.com_NoResultsFound_Txt') || 'No results found'}
              </div>
            </Col>
          ) : (
            filteredVets.map((item) => {
              const isClinic = !!item.creatorProfile;
              const itemKey = isClinic ? `clinic-${item.id}` : `vet-${item.id}`;
              const ratingData = !isClinic ? getVetDisplayRating(item.id) : null;
              
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={itemKey}>
                  <Card
                    hoverable
                    className="vet-card"
                    cover={
                      <img 
                        alt={item.nom || 'Veterinarian'} 
                        src={isClinic 
                          ? (item.picture ? base_url + 'uploads/files/etablissement/' + item.picture : etablissementPhotoDefaultSrc)
                          : (item.picture ? base_url + 'uploads/files/profile/' + item.picture : photoDefaultSrc)
                        } 
                        style={{ height: 250, objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = isClinic ? etablissementPhotoDefaultSrc : photoDefaultSrc;
                        }}
                      />
                    }
                  >
                    <Meta
                      title={
                        <Tooltip title={isClinic ? item.nom : `${item.prenom || ''} ${item.nom}`}>
                          <span style={{ fontSize: '16px', fontWeight: 600 }}>
                            {isClinic 
                              ? item.nom 
                              : `${item.prenom || ''} ${item.nom}`.trim()}
                          </span>
                        </Tooltip>
                      }
                      description={
                        <>
                          <p style={{ minHeight: '1.5em', color: '#666', marginBottom: '8px' }}>
                            {isClinic 
                              ? (item.etablissementType?.tagRef 
                                  ? getAContent(item.etablissementType.tagRef) 
                                  : item.etablissementType?.nom || getAContent('cmp_vetonest.com_Clinic_Txt') || 'Clinic')
                              : (item.vetoSpecialite?.tagRef 
                                  ? getAContent(item.vetoSpecialite.tagRef) 
                                  : item.vetoSpecialite?.nom || getAContent('cmp_vetonest.com_Veterinarian_Txt') || 'Veterinarian')
                            }
                          </p>
                          
                          {!isClinic && ratingData && (
                            <div style={{ marginBottom: '8px' }}>
                              <Rate 
                                disabled 
                                value={ratingData.average} 
                                allowHalf
                                style={{ fontSize: '14px' }}
                              />
                              {ratingData.count > 0 && (
                                <span style={{ marginLeft: '8px', color: '#888', fontSize: '12px' }}>
                                  ({ratingData.count})
                                </span>
                              )}
                              {ratingData.count === 0 && (
                                <span style={{ marginLeft: '8px', color: '#999', fontSize: '12px' }}>
                                  {getAContent('cmp_vetonest.com_NoReviews_Txt') || 'No reviews yet'}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {isClinic && (
                            <div style={{ marginBottom: '8px' }}>
                              <span style={{ color: '#999', fontSize: '12px' }}>
                                {getAContent('cmp_vetonest.com_Clinic_Txt') || 'Veterinary Clinic'}
                              </span>
                            </div>
                          )}
                          
                          {/* Location info if available */}
                          {item.city && (
                            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
                              📍 {item.city}, {item.country || ''}
                            </p>
                          )}
                        </>
                      }
                    />
                    <Button
                      type="primary"
                      icon={<ProfileOutlined />}
                      size="large"
                      block
                      onClick={() => handleGetAppointment(item.id, isClinic ? 'clinic' : 'vet')}
                      style={{ marginTop: '10px' }}
                    >
                      {isClinic 
                        ? (getAContent("cmp_vetonest.com_VisitClinicPage_Bt") || 'Visit Clinic')
                        : (getAContent("cmp_vetonest.com_VisitVetPage_Bt") || 'View Profile')}
                    </Button>
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