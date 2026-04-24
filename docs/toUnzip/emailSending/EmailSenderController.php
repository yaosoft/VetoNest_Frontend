<?php

namespace App\Controller;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;
use App\Service\Uploader\FileUploader;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\HttpFoundation\JsonResponse;

use Symfony\Bridge\Twig\Mime\BodyRenderer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Mailer;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use Symfony\Component\Mime\Address;

class EmailSenderController extends AbstractController
{
	public function sendEmail ( Request $request, EntityManagerInterface $entityManager ) {

		$response = new JsonResponse();

		// ── Core fields ───────────────────────────────────────────────────
		$to_email 		= $request->getPayload()->get( 'to_email' );
		$to_domain		= $request->getPayload()->get( 'to_domain' );
		$subject		= $request->getPayload()->get( 'subject' );
		$siteURL		= $request->getPayload()->get( 'siteURL' );
		$siteName		= $request->getPayload()->get( 'siteName' );
		$siteDomain		= $request->getPayload()->get( 'siteDomain' );
		$siteEmail		= $request->getPayload()->get( 'siteEmail' );
		$siteLocale		= $request->getPayload()->get( 'siteLocale' ) ?? 'en-GB';
		$userName		= $request->getPayload()->get( 'userName' );
		$emailTemplate	= $request->getPayload()->get( 'emailTemplate' );
		$code			= $request->getPayload()->get( 'code' );

		// ── Consultation-specific fields ──────────────────────────────────
		$vetName			= $request->getPayload()->get( 'vetName' );
		$ownerName			= $request->getPayload()->get( 'ownerName' );
		$petName			= $request->getPayload()->get( 'petName' );
		$consultationDate	= $request->getPayload()->get( 'consultationDate' );
		$consultationTime	= $request->getPayload()->get( 'consultationTime' );
		$complaint			= $request->getPayload()->get( 'complaint' );

		$from	= "VetoNest.fr <mailuser@vetonest.fr>";
		$to01 	= new Address( $to_email, $to_domain );
		$to02 	= new Address( "info@vetonest.com" );
		$to03 	= new Address( "yaosoft@hotmail.com" );

		// ── SMTP ──────────────────────────────────────────────────────────
		$smtp_email = "mailuser@vetonest.fr";
		$smtp_pass	= "kc!Loi.h14";
		$server 	= "mail.diamta.com";
		$port 		= "587";

		$dsn = "smtp://" . $smtp_email . ":" . $smtp_pass . "@" . $server . ":" . $port;
		$transport = Transport::fromDsn($dsn);
		$customMailer = new Mailer($transport);

		$email_content = ( new TemplatedEmail() )
			->from( $from )
			->to( $to01, $to02, $to03 )
			->subject( $subject )
			->htmlTemplate( 'emails/' . $emailTemplate . '.twig' )
			->context( [
				'siteURL'			=> $siteURL,
				'siteDomain'		=> $siteDomain,
				'siteName'			=> $siteName,
				'siteEmail'			=> $siteEmail,
				'siteLocale'		=> $siteLocale,
				'userName'			=> $userName,
				'code'				=> $code,
				// consultation variables
				'vetName'			=> $vetName,
				'ownerName'			=> $ownerName,
				'petName'			=> $petName,
				'consultationDate'	=> $consultationDate,
				'consultationTime'	=> $consultationTime,
				'complaint'			=> $complaint,
			]);

		// IMPORTANT: required when using a custom mailer instance
		// see https://github.com/symfony/symfony/issues/35990
		$loader = new FilesystemLoader('../templates/');
		$twigEnv = new Environment($loader);
		$twigBodyRenderer = new BodyRenderer($twigEnv);
		$twigBodyRenderer->render($email_content);

		$customMailer->send($email_content);

		$response->setData( "Email sent" );
		$response->setStatusCode( 200, "OK" );

		return $response;
	}
}
