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
}
