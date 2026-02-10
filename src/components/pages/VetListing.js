import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input, Row, Col, Card, Button, Rate, Skeleton } from 'antd';
import { SearchOutlined, CalendarOutlined, ProfileOutlined } from '@ant-design/icons';
import { SiteContext } from "../../context/site";
import Title from '../Title';
import Header from '../Header';
import Footer from '../Footer';

const { Meta } = Card;

const ListingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { 
    getAContent, base_url, allSpecialities, vetos, etablissements 
  } = useContext(SiteContext);

  const navigate = useNavigate();
  const location = useLocation();

  const photoDefaultSrc = '/img/user/1.jpg';
  const etablissementPhotoDefaultSrc = '/img/etablissement/1.jpg';

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
      const vList = vetos.filter((v) => v.nom.toLowerCase().includes(currentValue.toLowerCase()));
      const eList = etablissements.filter((e) => e.nom.toLowerCase().includes(currentValue.toLowerCase()));
      results = [...vList, ...eList];
    }
    else {
      results = [...vetos, ...etablissements];
    }

    // Filter by the secondary search bar ("Search in list")
    return results.filter((item) =>
      item.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      return `${getAContent('cmp_vetonest.com_SearchByName_Ph')} - ${currentValue}`;
    }

    // Case 2: Search by Veto Speciality
    if (currentName === 'vetoSpecialityId') {
      // Find the speciality in allSpecialities to get the tagRef
      const speciality = allSpecialities.find(s => s.id == currentValue);
      if (speciality) {
        return `${getAContent('cmp_vetonest.com_SearchBy_Txt')} ${getAContent(speciality.tagRef)}`;
      }
      // Fallback if results are empty or ID not found
      return getAContent('cmp_vetonest.com_NoVetFound_Txt');
    }

    // Case 3: Search by Clinic (Etablissement) Type
    if (currentName === 'etablissementTypeId') {
      // We can also find this by looking at the first item in the already filtered vetList
      if (filteredVets.length > 0 && filteredVets[0].etablissementType) {
        return `${getAContent('cmp_vetonest.com_SearchBy_Txt')} ${getAContent(filteredVets[0].etablissementType.tagRef)}`;
      }
      return getAContent('cmp_vetonest.com_NoEstablishmentFound_Txt');
    }

    // Case 4: Search by Location (City)
    if (currentName === 'location') {
      return `${getAContent('cmp_vetonest.com_SearchInCity_Txt')} - ${currentValue}`;
    }

    // Case 5: Default (All Vets)
    return getAContent('cmp_vetonest.com_AllVets_Txt');
    
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

  return (
    <>
      <div className="sticky-stack">
        <Header />
        <Title title={displayTitle} />
      </div>

      <div className="listing-page">
        <div className="search-bar">
          <Input
            placeholder={getAContent('cmp_vetonest.com_SearchInList_Ph') + '...'}
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ width: 300, marginBottom: '20px' }}
          />
        </div>

        {/* CRITICAL FIX: Adding key={location.search} to the Row forces 
            the entire grid to unmount and remount when the URL changes. 
        */}
        <Row gutter={[16, 16]} className="vet-list" key={location.search}>
          {loading ? (
            <Col span={24}><Skeleton active /></Col>
          ) : (
            filteredVets.map((item) => {
              // 2. CRITICAL FIX: Generate a TRULY unique key.
              // Since IDs 14 and 15 are duplicated between Vets and Clinics, 
              // we must prefix them to keep React's diffing algorithm happy.
              const isClinic = !!item.creatorProfile;
              const itemKey = isClinic ? `clinic-${item.id}` : `vet-${item.id}`;

              return (
                <Col xs={24} sm={12} md={8} key={itemKey}>
                  <Card
                    hoverable
                    className="vet-card"
                    cover={
                      <img 
                        alt="example" 
                        src={isClinic 
                          ? etablissementPhotoDefaultSrc 
                          : (item.picture ? base_url + 'uploads/files/profile/' + item.picture : photoDefaultSrc)
                        } 
                        style={{ height: 250, objectFit: 'cover' }}
                      />
                    }
                  >
                    <Meta
                      title={(item.prenom ? item.prenom + ' ' : '') + item.nom}
                      description={
                        <>
                          <p style={{ minHeight: '1.5em' }}>
                            {isClinic 
                              ? getAContent(item.type) 
                              : getAContent(item.vetoSpecialite?.tagRef || 'cmp_vetonest.com_nDHuiDhEz3')
                            }
                          </p>
                          <Rate disabled value={item.rating || 0} />
                          <p>&nbsp;</p>
                        </>
                      }
                    />
                    <Button
                      type="primary"
                      icon={<CalendarOutlined />}
                      size="large"
                      block
                      onClick={() => handleGetAppointment(item.id, isClinic ? 'clinic' : 'vet')}
                    >
                      {getAContent("cmp_vetonest.com_GetAppt_Bt")}
                    </Button>
                    <Button
                      type="default"
                      icon={<ProfileOutlined />}
                      size="large"
                      block
                      onClick={() => handleGetAppointment(item.id, isClinic ? 'clinic' : 'vet')}
                      style={{ marginTop: '10px', backgroundColor: '#f0f0f0' }}
                    >
                      {isClinic ? getAContent("cmp_vetonest.com_VisitClinicPage_Bt") : getAContent("cmp_vetonest.com_VisitVetPage_Bt")}
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