<?php

// recreated mostly from the Files Sharing app:
// https://raw.githubusercontent.com/owncloud/core/v9.1.0/apps/files_sharing/lib/Activity.php

namespace OCA\Passwords;

use OCP\Activity\IExtension;
use OCP\Activity\IManager;
use OCP\IL10N;
use OCP\IURLGenerator;
use OCP\L10N\IFactory;

class Activity implements IExtension {
	const PASSWORDS_APP = 'passwords';

	const FILTER_SHARES = 'passwords';

	const TYPE_EDITED = 'edited';
	const TYPE_SHARED = 'shared';
	const TYPE_SHARED_TO_ME = 'shared_to_me';
	const TYPE_SHARE_STOP = 'share_stop';
	const TYPE_DELETED = 'trashed';
	const TYPE_DELETED_PERMANENT = 'deleted';

	const SUBJECT_EDITED_USER_SELF = 'edited_user_self';
	const SUBJECT_SHARED_WITH = 'shared_with';
	const SUBJECT_SHARED_WITH_ME = 'shared_with_me';
	const SUBJECT_UNSHARED = 'unshared';
	const SUBJECT_DELETED_USER_SELF = 'deleted_user_self';
	const SUBJECT_DELETED_PERMANENT_USER_SELF = 'deleted_permanent_user_self';

	/** @var IFactory */
	protected $languageFactory;

	/** @var IURLGenerator */
	protected $URLGenerator;

	/** @var IManager */
	protected $activityManager;

	/**
	 * @param IFactory $languageFactory
	 * @param IURLGenerator $URLGenerator
	 * @param IManager $activityManager
	 */
	public function __construct(IFactory $languageFactory, IURLGenerator $URLGenerator, IManager $activityManager) {
		$this->languageFactory = $languageFactory;
		$this->URLGenerator = $URLGenerator;
		$this->activityManager = $activityManager;
	}

	protected function getL10N($languageCode = null) {
		return $this->languageFactory->get(self::PASSWORDS_APP, $languageCode);
	}

	/**
	 * The extension can return an array of additional notification types.
	 * If no additional types are to be added false is to be returned
	 *
	 * @param string $languageCode
	 * @return array|false
	 */
	public function getNotificationTypes($languageCode) {
		$l = $this->getL10N($languageCode);

		return [
			self::TYPE_EDITED => (string) $l->t('A password has been <strong>edited</strong> by me'),
			self::TYPE_SHARED => (string) $l->t('A password has been <strong>shared by me</strong>'),
			self::TYPE_SHARED_TO_ME => (string) $l->t('A password has been <strong>shared with me</strong>'),
			self::TYPE_SHARE_STOP => (string) $l->t('A <strong>shared</strong> password has been <strong>revoked</strong> by me'),
			self::TYPE_DELETED => (string) $l->t('A password has been <strong>trashed</strong>'),
			self::TYPE_DELETED_PERMANENT => (string) $l->t('A password has permanently been <strong>deleted</strong>'),
		];
	}

	/**
	 * For a given method additional types to be displayed in the settings can be returned.
	 * In case no additional types are to be added false is to be returned.
	 *
	 * @param string $method
	 * @return array|false
	 */
	public function getDefaultTypes($method) {
		$defaultTypes = [
			self::TYPE_EDITED,
			self::TYPE_SHARED,
			self::TYPE_SHARED_TO_ME,
			self::TYPE_SHARE_STOP,
			self::TYPE_DELETED,
			self::TYPE_DELETED_PERMANENT,
		];

		return $defaultTypes;
	}

	/**
	 * A string naming the css class for the icon to be used can be returned.
	 * If no icon is known for the given type false is to be returned.
	 *
	 * @param string $type
	 * @return string|false
	 */
	public function getTypeIcon($type) {
		switch ($type) {
			case self::TYPE_EDITED:
				return 'icon-change';
			case self::TYPE_SHARED:
			case self::TYPE_SHARED_TO_ME:
			case self::TYPE_SHARE_STOP:
				return 'icon-share';
			case self::TYPE_DELETED:
			case self::TYPE_DELETED_PERMANENT:
				return 'icon-delete';
		}

		return false;
	}

	/**
	 * The extension can translate a given message to the requested languages.
	 * If no translation is available false is to be returned.
	 *
	 * @param string $app
	 * @param string $text
	 * @param array $params
	 * @param boolean $stripPath
	 * @param boolean $highlightParams
	 * @param string $languageCode
	 * @return string|false
	 */
	public function translate($app, $text, $params, $stripPath, $highlightParams, $languageCode) {
		if ($app !== self::PASSWORDS_APP) {
			return false;
		}

		$l = $this->getL10N($languageCode);

		if ($this->activityManager->isFormattingFilteredObject()) {
			$translation = $this->translateShort($text, $l, $params);
			if ($translation !== false) {
				return $translation;
			}
		}

		return $this->translateLong($text, $l, $params);
	}

	/**
	 * @param string $text
	 * @param IL10N $l
	 * @param array $params
	 * @return bool|string
	 */
	protected function translateLong($text, IL10N $l, array $params) {

		switch ($text) {
			case self::SUBJECT_EDITED_USER_SELF:
				return (string) $l->t('You edited the password for %s (user %s)', $params);
			case self::SUBJECT_SHARED_WITH:
				return (string) $l->t('You shared your password for %s (user %s) with %s', $params);
			case self::SUBJECT_SHARED_WITH_ME:
				return (string) $l->t('%s has shared a password for %s (user %s) with you', $params);
			case self::SUBJECT_UNSHARED:
				return (string) $l->t('You stopped sharing your password for %s (user %s)', $params);
			case self::SUBJECT_DELETED_USER_SELF:
				return (string) $l->t('You moved the password for %s (user %s) to the trash', $params);
			case self::SUBJECT_DELETED_PERMANENT_USER_SELF:
				return (string) $l->t('You permanently deleted the password for %s (user %s)', $params);
		}

		return false;
	}

	/**
	 * @param string $text
	 * @param IL10N $l
	 * @param array $params
	 * @return bool|string
	 */
	protected function translateShort($text, IL10N $l, array $params) {
		switch ($text) {
			case self::SUBJECT_EDITED_USER_SELF:
				return (string) $l->t('Edited %s', $params);
			case self::SUBJECT_SHARED_WITH:
				return (string) $l->t('Shared %s by me', $params);
			case self::SUBJECT_SHARED_WITH_ME:
				return (string) $l->t('Shared %s to me', $params);
			case self::SUBJECT_UNSHARED:
				return (string) $l->t('Stopped sharing %s', $params);
			case self::SUBJECT_DELETED_USER_SELF:
				return (string) $l->t('Trashed %s', $params);
			case self::SUBJECT_DELETED_PERMANENT_USER_SELF:
				return (string) $l->t('Deleted %s', $params);
			default:
				return false;
		}
	}

	/**
	 * The extension can define the type of parameters for translation
	 *
	 * Currently known types are:
	 * * file		=> will strip away the path of the file and add a tooltip with it
	 * * username	=> will add the avatar of the user
	 *
	 * @param string $app
	 * @param string $text
	 * @return array|false
	 */
	public function getSpecialParameterList($app, $text) {
		if ($app === self::PASSWORDS_APP) {
			switch ($text) {
				case self::SUBJECT_SHARED_WITH:
					return [
						0 => '',
						1 => '',
						2 => 'username',
					];
				case self::SUBJECT_SHARED_WITH_ME:
					return [
						0 => 'username',
						1 => '',
						2 => '',
					];
			}
		}

		return false;
	}

	/**
	 * The extension can define the parameter grouping by returning the index as integer.
	 * In case no grouping is required false is to be returned.
	 *
	 * @param array $activity
	 * @return integer|false
	 */
	public function getGroupParameter($activity) {
		if ($activity['app'] === self::PASSWORDS_APP) {
			switch ($activity['subject']) {
				//case self::(new subject):
					// Group by file name
					// return 0;
				case self::SUBJECT_EDITED_USER_SELF:
				case self::SUBJECT_SHARED_WITH:
				case self::SUBJECT_SHARED_WITH_ME:
				case self::SUBJECT_UNSHARED:
				case self::SUBJECT_DELETED_USER_SELF:
				case self::SUBJECT_DELETED_PERMANENT_USER_SELF:
					// Group by user/group
					return 1;
			}
		}

		return false;
	}

	/**
	 * The extension can define additional navigation entries. The array returned has to contain two keys 'top'
	 * and 'apps' which hold arrays with the relevant entries.
	 * If no further entries are to be added false is no be returned.
	 *
	 * @return array|false
	 */
	public function getNavigation() {
		$l = $this->getL10N();
		return [
			'apps' => [],
			'top' => [
				self::FILTER_SHARES => [
					'id' => self::FILTER_SHARES,
					'name' => (string) $l->t('Passwords'),
					'url' => $this->URLGenerator->linkToRoute('activity.Activities.showList', ['filter' => self::FILTER_SHARES]),
				],
			],
		];
	}

	/**
	 * The extension can check if a custom filter (given by a query string like filter=abc) is valid or not.
	 *
	 * @param string $filterValue
	 * @return boolean
	 */
	public function isFilterValid($filterValue) {
		return $filterValue === self::FILTER_SHARES;
	}

	/**
	 * The extension can filter the types based on the filter if required.
	 * In case no filter is to be applied false is to be returned unchanged.
	 *
	 * @param array $types
	 * @param string $filter
	 * @return array|false
	 */
	public function filterNotificationTypes($types, $filter) {
		switch ($filter) {
			case self::FILTER_SHARES:
				return array_intersect([
						self::TYPE_EDITED, 
						self::TYPE_SHARED, 
						self::TYPE_SHARED_TO_ME, 
						self::TYPE_SHARE_STOP
					], $types);
		}
		return false;
	}

	/**
	 * For a given filter the extension can specify the sql query conditions including parameters for that query.
	 * In case the extension does not know the filter false is to be returned.
	 * The query condition and the parameters are to be returned as array with two elements.
	 * E.g. return array('`app` = ? and `message` like ?', array('mail', 'ownCloud%'));
	 *
	 * @param string $filter
	 * @return array|false
	 */
	public function getQueryForFilter($filter) {
		if ($filter === self::FILTER_SHARES) {
			return [
				'`app` = ?',
				[self::PASSWORDS_APP,],
			];
		}
		return false;
	}

}
