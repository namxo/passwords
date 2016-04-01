<?php
namespace OCA\Passwords\Db;

use \OCP\IDb;
use \OCP\AppFramework\Db\Mapper;

class PasswordMapper extends Mapper {

	public function __construct(IDb $db) {
		parent::__construct($db, 'passwords', '\OCA\Passwords\Db\Password');
	}

	public function find($id, $userId) {
		$sql = 'SELECT * FROM *PREFIX*passwords WHERE id = ? AND user_id = ?';
		return $this->findEntity($sql, [$id, $userId]);
	}

	public function findAll($userId) {

		// get all passwords of this user and all passwords that are shared with this user (still encrypted)
		$sql = 'SELECT id, user_id, loginname, website, address, pass, properties, notes, creation_date, deleted FROM *PREFIX*passwords ' . 
				'WHERE user_id = ? OR id IN (SELECT pwid FROM *PREFIX*passwords_share WHERE sharedto = ?) ';

		// now get all uid's and displaynames this user is eligable to share with
		$sharing_allowed = \OC::$server->getConfig()->getAppValue('core', 'shareapi_enabled', 'yes') == 'yes';
		if ($sharing_allowed) {
			$only_share_with_own_group = \OC::$server->getConfig()->getAppValue('core', 'shareapi_only_share_with_group_members', 'yes') == 'yes';
			if ($only_share_with_own_group) {
				$sql = $sql . 'UNION ALL ' .
					'SELECT  ' .
						'DISTINCT displaynames.uid as id, ' .
						'displaynames.displayname as user_id, ' .
						'NULL as loginname, ' .
						'displaynames.uid as website, ' .
						'NULL as address, ' .
						'NULL as pass, ' .
						'NULL as properties, ' .
						'NULL as notes, ' .
						'NULL as creation_date, ' .
						'NULL as deleted ' .
					'FROM *PREFIX*group_user AS users ' .
						'LEFT JOIN  ' .
						'(SELECT uid, CASE WHEN displayname IS NULL THEN uid ELSE displayname END AS displayname FROM *PREFIX*users) AS displaynames ON users.uid = displaynames.uid  ' .
					'WHERE gid IN (SELECT DISTINCT gid FROM *PREFIX*group_user WHERE uid = ?)';
			} else {
				$sql = $sql . 'UNION ALL ' .
					'SELECT  ' .
						'uid as id, ' .
						'CASE WHEN displayname IS NULL THEN uid ELSE displayname END as user_id, ' .
						'NULL as loginname, ' .
						'uid as website, ' .
						'NULL as address, ' .
						'NULL as pass, ' .
						'NULL as properties, ' .
						'NULL as notes, ' .
						'NULL as creation_date, ' .
						'NULL as deleted ' .
					'FROM *PREFIX*users';
			}
		}

		// order by website according to database used
		$dbtype = \OC::$server->getConfig()->getSystemValue('dbtype', '');
		if ($dbtype == 'mysql') {
			$sql = $sql . ' ORDER BY LOWER(website) COLLATE utf8_general_ci ASC';
		} else if ($dbtype == 'sqlite') {
			$sql = $sql . ' ORDER BY website COLLATE NOCASE';
		} else {
			$sql = $sql . ' ORDER BY LOWER(website) ASC';
		}
		
		if ($only_share_with_own_group) {
			return $this->findEntities($sql, [$userId, $userId, $userId]);
		} else {
			return $this->findEntities($sql, [$userId, $userId]);
		}
	}

	public function insertShare($pwid, $shareto, $sharekey) {
		$sql = 'INSERT INTO *PREFIX*passwords_share (id, pwid, sharedto, sharekey) VALUES (NULL, ?, ?, ?)';
		$sql = $this->db->prepare($sql);
		$sql->bindParam(1, $pwid, \PDO::PARAM_INT);
		$sql->bindParam(2, $shareto, \PDO::PARAM_STR);
		$sql->bindParam(3, $sharekey, \PDO::PARAM_STR);
		$sql->execute();
		return true;
	}

	public function deleteShare($pwid, $shareto) {
		$sql = 'DELETE FROM *PREFIX*passwords_share WHERE pwid = ? AND sharedto = ?';
		$sql = $this->db->prepare($sql);
		$sql->bindParam(1, $pwid, \PDO::PARAM_INT);
		$sql->bindParam(2, $shareto, \PDO::PARAM_STR);
		$sql->execute();
		return true;
	}
	public function deleteSharesbyID($pwid) {
		$sql = 'DELETE FROM *PREFIX*passwords_share WHERE pwid = ?';
		$sql = $this->db->prepare($sql);
		$sql->bindParam(1, $pwid, \PDO::PARAM_INT);
		$sql->execute();
		return true;
	}

	public function getShareKey($pwid, $userId) {
		$sql = 'SELECT * FROM *PREFIX*passwords_share WHERE pwid= ? AND sharedto = ?';
		$sql = $this->db->prepare($sql);
		$sql->bindParam(1, $pwid, \PDO::PARAM_INT);
		$sql->bindParam(2, $userId, \PDO::PARAM_STR);
		$sql->execute();
		$row = $sql->fetch();
		$sql->closeCursor();
		return $row['sharekey'];
	}
}
