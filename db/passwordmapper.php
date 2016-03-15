<?php
namespace OCA\Passwords\Db;

use OCP\IDb;
use OCP\AppFramework\Db\Mapper;

class PasswordMapper extends Mapper {

	public function __construct(IDb $db) {
		parent::__construct($db, 'passwords', '\OCA\Passwords\Db\Password');
	}

	public function find($id, $userId) {
		$sql = 'SELECT * FROM *PREFIX*passwords WHERE id = ? AND user_id = ?';
		return $this->findEntity($sql, [$id, $userId]);
	}

	public function findAll($userId) {
		$dbtype = \OC::$server->getConfig()->getSystemValue('dbtype', '');
		if ($dbtype == 'mysql') {
			$sql = 'SELECT * FROM *PREFIX*passwords WHERE user_id = ? ORDER BY LOWER(website) COLLATE utf8_general_ci ASC';
		} else if ($dbtype == 'sqlite') {
			$sql = 'SELECT * FROM *PREFIX*passwords WHERE user_id = ? ORDER BY website COLLATE NOCASE';
		} else {
			$sql = 'SELECT * FROM *PREFIX*passwords WHERE user_id = ? ORDER BY LOWER(website) ASC';
		}
		return $this->findEntities($sql, [$userId]);
	}

	public function shareUsers($userId) {
		$allowed = \OC::$server->getConfig()->getAppValue('core', 'shareapi_enabled', true);
		if ($allowed) {
			$sql = 'SELECT DISTINCT displaynames.uid, displaynames.displayname FROM *PREFIX*group_user AS users LEFT JOIN (SELECT  uid, IF(displayname IS NULL, uid, displayname) AS displayname FROM *PREFIX*users) AS displaynames ON users.uid = displaynames.uid WHERE gid IN (SELECT DISTINCT gid FROM *PREFIX*group_user WHERE uid = ?';
			return $this->findEntities($sql, [$userId]);
		} else {
			return false;
		}
	}
}
