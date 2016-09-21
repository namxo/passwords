<?php

namespace OCA\Passwords;

use OC\BackgroundJob\QueuedJob;
use OCP\Activity\IManager;
use OCP\IURLGenerator;
use OCP\IUser;
use OCP\IUserManager;
use OCP\Notification\IManager as INotificationManager;

class BackgroundJob extends QueuedJob {
	/** @var INotificationManager */
	protected $notificationManager;

	/** @var IUserManager */
	private $userManager;

	/** @var IURLGenerator */
	private $urlGenerator;

	/** @var Manager */
	private $manager;

	/** @var IManager */
	private $activityManager;

	/**
	 * @param IUserManager $userManager
	 * @param IManager $activityManager
	 * @param INotificationManager $notificationManager
	 * @param IURLGenerator $urlGenerator
	 * @param Manager $manager
	 */
	public function __construct(IUserManager $userManager, IManager $activityManager, INotificationManager $notificationManager, IURLGenerator $urlGenerator, Manager $manager) {
		$this->userManager = $userManager;
		$this->activityManager = $activityManager;
		$this->notificationManager = $notificationManager;
		$this->urlGenerator = $urlGenerator;
		$this->manager = $manager;
	}

	/**
	 * @param array $argument
	 */
	public function run($argument) {
		try {
			$password = $this->manager->getPassword($argument['id'], false);
		} catch (\InvalidArgumentException $e) {
			// Password was deleted in the meantime, so no need to announce it anymore
			// So we die silently
			return;
		}

		$this->createPublicity($password['id'], $password['author'], $password['time']);
	}

	/**
	 * @param int $id
	 * @param string $authorId
	 * @param int $timeStamp
	 */
	protected function createPublicity($id, $authorId, $timeStamp) {
		$event = $this->activityManager->generateEvent();
		$event->setApp('passwords')
			->setType('passwords')
			->setAuthor($authorId)
			->setTimestamp($timeStamp)
			->setSubject('passwordsubject#' . $id, [$authorId])
			->setMessage('passwordmessage#' . $id, [$authorId])
			->setObject('password', $id);

		$dateTime = new \DateTime();
		$dateTime->setTimestamp($timeStamp);

		$notification = $this->notificationManager->createNotification();
		$notification->setApp('passwords')
			->setDateTime($dateTime)
			->setObject('password', $id)
			->setSubject('announced', [$authorId])
			->setLink($this->urlGenerator->linkToRoute('passwords.page.index'));

		$this->userManager->callForAllUsers(function(IUser $user) use ($authorId, $event, $notification) {
			$event->setAffectedUser($user->getUID());
			$this->activityManager->publish($event);

			if ($authorId !== $user->getUID()) {
				$notification->setUser($user->getUID());
				$this->notificationManager->notify($notification);
			}
		});
	}
}
