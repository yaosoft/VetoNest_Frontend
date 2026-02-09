import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Input, Row, Col, Card, Button, Rate, Skeleton } from 'antd';
import { SearchOutlined, CalendarOutlined, ProfileOutlined } from '@ant-design/icons';
import { SiteContext } from "../../context/site";
import { AuthContext } from "../../context/AuthProvider";
import Title from '../Title';
import Header from '../Header';
import Footer from '../Footer';
const { Meta } = Card;

const ListingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vetList, setVetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  // const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const { 
    getAContent, getAVetoProfile, getTimeslot, getHollydays, getAbsences, truncateString,
    getAVetoLieux, siteLocale, base_url, allSpecialities, vetos, etablissements 
  } = useContext(SiteContext);

  const [photoDefaultSrc, setPhotoDefaultSrc] = useState('/img/user/1.jpg');
  const [etablissementPhotoDefaultSrc, setEtablissementPhotoDefaultSrc] = useState('/img/etablissement/1.jpg');


  const navigate = useNavigate();
  const location = useLocation();

  // Fetching vet data
  useEffect(() => {
    // setLoading(true);
// console.log( 'eeeeeeeeeee etablissements', etablissements );
// console.log( 'vvvvvvvvvvv vetos', vetos );
// console.log( 'sssssssssss searchName', searchName );

	// Get fresh values directly from the URL
// Get fresh values directly from the URL
    const currentParams = new URLSearchParams(location.search);
    const currentName = currentParams.get("searchName");
    const currentValue = currentParams.get("searchValue");

    if ( vetos.length || etablissements.length ) {
	  var veterinarianList = Array();
	  var etablissementList = Array();
      if (currentName == 'name') {	// search by veto or clinic name: currently not in use
		if ( vetos.length){
			veterinarianList = vetos.filter((vet) =>
			  vet.nom.toLowerCase().includes(currentName.toLowerCase()) ||
			  vet.prenom && vet.prenom.toLowerCase().includes(currentName.toLowerCase()) ||
			  vet.biography && vet.biography.toLowerCase().includes(currentName.toLowerCase())
			);
		}
		if ( etablissements.length){
			etablissementList = etablissements.filter((etablissement) =>
			  etablissement.nom.toLowerCase().includes(currentValue.toLowerCase()) ||
			  etablissement.presentation.toLowerCase().includes(currentValue.toLowerCase())
			);
		}

        setVetList(veterinarianList.concat(etablissementList));

        const title = getAContent( 'cmp_vetonest.com_SearchByName_Ph' ) + ' - ' + currentValue;
        setTitle(title);
      }
      else if (currentName == 'vetoSpecialityId') { // search by veto speciality
        const vetList = vetos.filter((vet) => vet.vetoSpecialite.id == currentValue);
        setVetList(vetList);
		
		var title = '';
		if( vetList.length )
			title = getAContent( 'cmp_vetonest.com_SearchBy_Txt' ) + ' - ' + getAContent(vetList[0].vetoSpecialite.tagRef);
		else
			title = getAContent( 'cmp_vetonest.com_NoVetFound_Txt' );
		setTitle(title);
      }
      else if (currentName == 'etablissementTypeId') { // search clinic type
        const etablissementList = etablissements.filter((etablissement) => etablissement.etablissementType.id == currentValue);
        setVetList(etablissementList);

		var title = '';
		if( etablissementList.length )
			title = getAContent( 'cmp_vetonest.com_SearchBy_Txt' ) + ' - ' + getAContent( etablissementList[0].etablissementType.tagRef );
		else
			title = getAContent( 'cmp_vetonest.com_NoEstablishmentFound_Txt' );
        setTitle(title);
      }
      else if (currentName == 'location') { // search by location ( city id )
		if ( vetos.length){		// search vets
			veterinarianList = vetos.filter((vet) =>
			  vet.villes.includes(currentValue))
		}
		if ( etablissements.length){ // search clinics
			etablissementList = etablissements.filter((etablissement) =>
			  etablissement.villes.includes(currentValue))
		}

        setVetList(veterinarianList.concat(etablissementList));

        const title = getAContent( 'cmp_vetonest.com_SearchInCity_Txt' ) + ' - ' + currentValue;
        setTitle(title);
      }
	  else{ // search all
		setVetList(vetos.concat(etablissements));
        const title = getAContent( 'cmp_vetonest.com_AllVets_Txt' );
        setTitle(title);
	  }
    }
    setLoading(false);
  }, [vetos, etablissements, location.search]);

  const filteredVets = vetList.filter((vet) =>
    vet.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleGetAppointment = (id, type) => {
    if (type == 'vet') {
      navigate('/vet-profile?vetId=' + id);
    } else if (type == 'clinic') {
      navigate('/etablissement?etablissementId=' + id);  // Modify the route as needed
    }
  };

  return (
    <>
      <div className="sticky-stack">
        <Header />
        <Title title={title} />
      </div>

      <div className="listing-page">
        {/* Search and Filter */}
        <div className="search-bar">
          <Input
            placeholder= { getAContent( 'cmp_vetonest.com_SearchInList_Ph' ) + '...' }
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ width: 300 }}
          />
        </div>

        {/* Vet List */}
        <Row gutter={16} className="vet-list">
          {loading ? (
            <Col span={8}>
              <Skeleton active />
            </Col>
          ) : (
            filteredVets.map((vet) => (
              <Col xs={24} sm={12} md={8} key={vet.id}>
                <Card
                  hoverable
                  cover={
                    vet.creatorProfile ?
                      <img src={etablissementPhotoDefaultSrc} alt="Clinic page" />
                      :
                      <img
                        src={vet.picture ? base_url + 'uploads/files/profile/' + vet.picture : photoDefaultSrc}
                        alt={ getAContent( 'cmp_vetonest.com_VetPage_Txt' ) }
                      />
                  }
                  className="vet-card"
                >
                  <Meta
                    title={vet.nom}
                    description={
                      <>
                        <p>
                          {
							!vet.creatorProfile ?
								allSpecialities.length && vet.vetoSpecialite
								? getAContent(
									allSpecialities.filter(
									  (e) => e.id === vet.vetoSpecialite.id
									)[0].tagRef
								  )
								: getAContent('cmp_vetonest.com_nDHuiDhEz3')
							:
								getAContent( vet.type )
						  }
                        </p>
                        <Rate disabled value={vet.rating} />
                        <p>&nbsp;</p>
                      </>
                    }
                  />
                  {/* Buttons: Get an Appointment and Visit the Vet Page */}
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    size="large"
                    block
                    onClick={() => handleGetAppointment(vet.id, vet.creatorProfile ? 'clinic' : 'vet')}
                  >
					{ getAContent( "cmp_vetonest.com_GetAppt_Bt" ) }
                  </Button>
                  <Button
                    type="default"
                    icon={<ProfileOutlined />}
                    size="large"
                    block
                    onClick={() => handleGetAppointment(vet.id, vet.creatorProfile ? 'clinic' : 'vet')}
                    style={{ marginTop: '10px', backgroundColor: '#f0f0f0' }}
                  >
				   { !vet.creatorProfile ? getAContent( "cmp_vetonest.com_VisitVetPage_Bt" ) : getAContent( "cmp_vetonest.com_VisitClinicPage_Bt" ) } 
                  </Button>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </div>
      <div>&nbsp;</div>
      <Footer />
    </>
  );
};

export default ListingPage;
