<?php

namespace App\Controller;

use App\Entity\Consultation;
use App\Entity\ProfileVeto;
use App\Entity\ConsultationType;
use App\Entity\ConsultationMotif;
use App\Entity\Etablissement;
use App\Entity\CarnetAnimal;
use App\Entity\ConsultationStatus;
use App\Entity\Symptom;
use App\Entity\User;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

class ConsultationController extends AbstractController
{

    public function edit(Request $request, EntityManagerInterface $entityManager): Response
    {
		$response = new JsonResponse();

		$consultationId			= $request->getPayload()->get('consultationId');
		$carnetAnimalId			= $request->getPayload()->get('carnetAnimalId');
		$profileVetoId			= $request->getPayload()->get('profileVetoId');
		$startingDatetime		= $request->getPayload()->get('startingDatetime');   // "YYYY-MM-DD HH:mm"
		$description			= $request->getPayload()->get('description');
		$consultationTypeId		= $request->getPayload()->get('consultationTypeId');
		$consultationStatusId	= $request->getPayload()->get('consultationStatusId'); // 1 = pending
		$consultationMotifId	= $request->getPayload()->get('consultationMotifId');
		$etablissementId		= $request->getPayload()->get('etablissementId');
		$symptomId				= $request->getPayload()->get('symptomId');             // from symptom save step
		$enabled				= $request->getPayload()->get('enabled') ?? true;

		// ── Validate required fields ─────────────────────────────────────────
		if (!$carnetAnimalId || !$profileVetoId || !$consultationTypeId || !$startingDatetime) {
			$response->setData(['success' => false, 'message' => 'carnetAnimalId, profileVetoId, consultationTypeId and startingDatetime are required']);
			$response->setStatusCode(400);
			return $response;
		}

		// ── Create or update ─────────────────────────────────────────────────
		if ($consultationId) {
			$consultation = $entityManager->getRepository(Consultation::class)->find($consultationId);
			if (!$consultation) {
				$response->setData(['success' => false, 'message' => 'Consultation not found']);
				$response->setStatusCode(404);
				return $response;
			}
		} else {
			$consultation = new Consultation();
			$consultation->setCreationDate(new \DateTime());
		}

		// ── Resolve related entities ─────────────────────────────────────────
		$carnetAnimal = $entityManager->getRepository(CarnetAnimal::class)->find($carnetAnimalId);
		if (!$carnetAnimal) {
			$response->setData(['success' => false, 'message' => 'Pet (carnetAnimal) not found']);
			$response->setStatusCode(404);
			return $response;
		}

		$profileVeto = $entityManager->getRepository(ProfileVeto::class)->find($profileVetoId);
		if (!$profileVeto) {
			$response->setData(['success' => false, 'message' => 'Veterinarian not found']);
			$response->setStatusCode(404);
			return $response;
		}

		$consultationType = $entityManager->getRepository(ConsultationType::class)->find($consultationTypeId);
		if (!$consultationType) {
			$response->setData(['success' => false, 'message' => 'Consultation type not found']);
			$response->setStatusCode(404);
			return $response;
		}

		$consultationStatus = $consultationStatusId
			? $entityManager->getRepository(ConsultationStatus::class)->find($consultationStatusId)
			: $entityManager->getRepository(ConsultationStatus::class)->find(1); // default: pending

		$consultationMotif = $consultationMotifId
			? $entityManager->getRepository(ConsultationMotif::class)->find($consultationMotifId)
			: null;

		$etablissement = $etablissementId
			? $entityManager->getRepository(Etablissement::class)->find($etablissementId)
			: null;

		// ── Link symptom if provided ─────────────────────────────────────────
		$symptom = null;
		if ($symptomId) {
			$symptom = $entityManager->getRepository(Symptom::class)->find($symptomId);
			if (!$symptom) {
				$response->setData(['success' => false, 'message' => 'Symptom not found']);
				$response->setStatusCode(404);
				return $response;
			}
		}

		// ── Parse starting datetime ──────────────────────────────────────────
		$startingDate = \DateTime::createFromFormat('Y-m-d H:i', $startingDatetime);
		if (!$startingDate) {
			$response->setData(['success' => false, 'message' => 'Invalid startingDatetime format, expected YYYY-MM-DD HH:mm']);
			$response->setStatusCode(400);
			return $response;
		}

		// ── Set fields ───────────────────────────────────────────────────────
		$consultation->setStartingDatetime($startingDate);
		$consultation->setDescription($description ?? '');
		$consultation->setEnabled((bool) $enabled);
		$consultation->setCarnetAnimal($carnetAnimal);
		$consultation->setProfileVeto($profileVeto);
		$consultation->setConsultationType($consultationType);
		$consultation->setConsultationStatus($consultationStatus);
		if ($consultationMotif) {
			$consultation->setConsultationMotif($consultationMotif);
		}
		if ($etablissement) {
			$consultation->setEtablissement($etablissement);
		}
		if ($symptom) {
			$consultation->setSymptom($symptom);
		}

		$entityManager->persist($consultation);
		$entityManager->flush();

		$response->setData([
			'success'        => true,
			'consultationId' => $consultation->getId(),
			'message'        => 'Consultation saved successfully',
		]);
		$response->setStatusCode(200);

		return $response;
    }

   // ── Shared helper: serialize one consultation into an array ──────────────
   private function serializeConsultation(Consultation $c, string $base_url): array
   {
		$vet     = $c->getProfileVeto();
		$pet     = $c->getCarnetAnimal();
		$type    = $c->getConsultationType();
		$status  = $c->getConsultationStatus();
		$clinic  = $c->getEtablissement();
		$symptom = $c->getSymptom();

		return [
			'id'                => $c->getId(),
			'startingDatetime'  => $c->getStartingDatetime()?->format('Y-m-d H:i'),
			'creationDate'      => $c->getCreationDate()?->format('Y-m-d H:i'),
			'description'       => $c->getDescription(),
			'enabled'           => $c->isEnabled(),

			'consultationType'  => $type ? [
				'id'   => $type->getId(),
				'nom'  => $type->getNom(),
			] : null,

			'consultationStatus' => $status ? [
				'id'   => $status->getId(),
				'nom'  => $status->getNom(),
			] : null,

			'profileVeto' => $vet ? [
				'id'      => $vet->getId(),
				'prenom'  => $vet->getPrenom(),
				'nom'     => $vet->getNom(),
				'picture' => $vet->getPicture()
					? $base_url . 'uploads/files/profile/' . $vet->getPicture()
					: null,
			] : null,

			'carnetAnimal' => $pet ? [
				'id'      => $pet->getId(),
				'nom'     => $pet->getNom(),
				'picture' => $pet->getPicture()
					? $base_url . 'uploads/files/pets/' . $pet->getPicture()
					: null,
			] : null,

			'etablissement' => $clinic ? [
				'id'  => $clinic->getId(),
				'nom' => $clinic->getNom(),
			] : null,

			'symptom' => $symptom ? [
				'id'                     => $symptom->getId(),
				'primaryComplaint'       => $symptom->getPrimaryComplaint(),
				'detectedSymptoms'       => $symptom->getDetectedSymptoms(),
				'urgency'                => $symptom->getUrgency(),
				'followUpAnswers'        => $symptom->getFollowUpAnswers(),
				'recommendedSpecialityId' => $symptom->getRecommendedSpecialityId(),
				'recommendedClinicTypeId' => $symptom->getRecommendedClinicTypeId(),
				'notes'                  => $symptom->getNotes(),
			] : null,
		];
   }

   // ── List consultations for a pet owner (all their pets) ─────────────────
   public function listForPetOwner(Request $request, EntityManagerInterface $entityManager): Response
   {
		$response = new JsonResponse();

		$userId   = $request->get('userId');
		$statusId = $request->get('statusId');
		$base_url = $request->getSchemeAndHttpHost() . '/';

		if (!$userId) {
			$response->setData(['success' => false, 'message' => 'userId is required']);
			$response->setStatusCode(400);
			return $response;
		}

		$user = $entityManager->getRepository(User::class)->find($userId);
		if (!$user) {
			$response->setData(['success' => false, 'message' => 'User not found']);
			$response->setStatusCode(404);
			return $response;
		}

		// Fetch all pets belonging to this user
		$pets = $entityManager->getRepository(CarnetAnimal::class)
			->findBy(['user' => $user, 'enabled' => true]);

		if (empty($pets)) {
			$response->setData(['success' => true, 'consultations' => []]);
			$response->setStatusCode(200);
			return $response;
		}

		// Resolve optional status filter
		$statusEntity = null;
		if ($statusId) {
			$statusEntity = $entityManager->getRepository(ConsultationStatus::class)->find($statusId);
		}

		// Fetch consultations for all pets using DQL for efficiency
		$qb = $entityManager->createQueryBuilder()
			->select('c')
			->from(Consultation::class, 'c')
			->where('c.carnetAnimal IN (:pets)')
			->andWhere('c.enabled = true')
			->setParameter('pets', $pets)
			->orderBy('c.startingDatetime', 'DESC');

		if ($statusEntity) {
			$qb->andWhere('c.consultationStatus = :status')
			   ->setParameter('status', $statusEntity);
		}

		$consultations = $qb->getQuery()->getResult();

		$data = array_map(
			fn($c) => $this->serializeConsultation($c, $base_url),
			$consultations
		);

		$response->setData(['success' => true, 'consultations' => $data]);
		$response->setStatusCode(200);
		return $response;
   }

   // ── List consultations for a vet ─────────────────────────────────────────
   public function listForVet(Request $request, EntityManagerInterface $entityManager): Response
   {
		$response = new JsonResponse();

		$profileVetoId = $request->get('profileVetoId');
		$statusId      = $request->get('statusId');        // optional filter
		$base_url      = $request->getSchemeAndHttpHost() . '/';

		if (!$profileVetoId) {
			$response->setData(['success' => false, 'message' => 'profileVetoId is required']);
			$response->setStatusCode(400);
			return $response;
		}

		$vet = $entityManager->getRepository(ProfileVeto::class)->find($profileVetoId);
		if (!$vet) {
			$response->setData(['success' => false, 'message' => 'Veterinarian not found']);
			$response->setStatusCode(404);
			return $response;
		}

		$criteria = ['profileVeto' => $vet, 'enabled' => true];
		if ($statusId) {
			$status = $entityManager->getRepository(ConsultationStatus::class)->find($statusId);
			if ($status) $criteria['consultationStatus'] = $status;
		}

		$consultations = $entityManager->getRepository(Consultation::class)
			->findBy($criteria, ['startingDatetime' => 'ASC']); // vets see upcoming first

		$data = array_map(
			fn($c) => $this->serializeConsultation($c, $base_url),
			$consultations
		);

		$response->setData(['success' => true, 'consultations' => $data]);
		$response->setStatusCode(200);
		return $response;
   }

   // ── Accept a consultation (vet action) ───────────────────────────────────
   public function accept(Request $request, EntityManagerInterface $entityManager): Response
   {
		$response = new JsonResponse();

		$consultationId = $request->getPayload()->get('consultationId');
		if (!$consultationId) {
			$response->setData(['success' => false, 'message' => 'consultationId is required']);
			$response->setStatusCode(400);
			return $response;
		}

		$consultation = $entityManager->getRepository(Consultation::class)->find($consultationId);
		if (!$consultation) {
			$response->setData(['success' => false, 'message' => 'Consultation not found']);
			$response->setStatusCode(404);
			return $response;
		}

		// Status 2 = Accepted
		$status = $entityManager->getRepository(ConsultationStatus::class)->find(2);
		if (!$status) {
			$response->setData(['success' => false, 'message' => 'Accepted status not found']);
			$response->setStatusCode(500);
			return $response;
		}

		$consultation->setConsultationStatus($status);
		$entityManager->flush();

		$response->setData(['success' => true, 'message' => 'Consultation accepted']);
		$response->setStatusCode(200);
		return $response;
   }

   // ── Cancel a consultation (pet owner action) ─────────────────────────────
   public function cancel(Request $request, EntityManagerInterface $entityManager): Response
   {
		$response = new JsonResponse();

		$consultationId = $request->getPayload()->get('consultationId');
		if (!$consultationId) {
			$response->setData(['success' => false, 'message' => 'consultationId is required']);
			$response->setStatusCode(400);
			return $response;
		}

		$consultation = $entityManager->getRepository(Consultation::class)->find($consultationId);
		if (!$consultation) {
			$response->setData(['success' => false, 'message' => 'Consultation not found']);
			$response->setStatusCode(404);
			return $response;
		}

		// Enforce 1-hour rule
		$now  = new \DateTime();
		$diff = $consultation->getStartingDatetime()->getTimestamp() - $now->getTimestamp();
		if ($diff < 3600) {
			$response->setData(['success' => false, 'message' => 'Cannot cancel a consultation less than 1 hour before it starts']);
			$response->setStatusCode(403);
			return $response;
		}

		// Status 3 = Cancelled
		$status = $entityManager->getRepository(ConsultationStatus::class)->find(3);
		if (!$status) {
			$response->setData(['success' => false, 'message' => 'Cancelled status not found']);
			$response->setStatusCode(500);
			return $response;
		}

		$consultation->setConsultationStatus($status);
		$entityManager->flush();

		$response->setData(['success' => true, 'message' => 'Consultation cancelled']);
		$response->setStatusCode(200);
		return $response;
   }

   // ── Legacy list (kept for backward compat) ───────────────────────────────
   public function list(Request $request, EntityManagerInterface $entityManager): Response
   {
		$response = new JsonResponse();
		$response->setData(['success' => true, 'consultations' => []]);
		$response->setStatusCode(200);
		return $response;
   }


	
    public function show(Request $request, EntityManagerInterface $entityManager): Response
    {
		$response = new JsonResponse();
		
		$id 	= $request->get('consultationId');
		
        $consultation = $entityManager->getRepository( Consultation::class )->findOneById( $id );
		
		$response->setData( $consultation );
		$response->setStatusCode( 200, "Okay" );
		
		return $response;
    }

    public function delete(Request $request, EntityManagerInterface $entityManager): Response
    {
		$response = new JsonResponse();
		
		$consultationId 	= $request->get('consultationId');
		$consultation 		= $entityManager->getRepository( Consultation::class )
		->findOneById( $consultationId );
		
		$id = $consultation->getId();
		
		$entityManager->remove($consultation);
		$entityManager->flush();

		$response->setData( "Consultation " . $id . " deleted" );
		$response->setStatusCode( 200, "Okay" );
		
		return $response;
    }

}
