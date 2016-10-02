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
		$sql = 'SELECT CAST(id AS CHAR) AS id, user_id, loginname, website, address, pass, properties, notes, creation_date, deleted FROM *PREFIX*passwords ' . 
				'WHERE user_id = ? OR id IN (SELECT pwid FROM *PREFIX*passwords_share WHERE sharedto = ?) ';

		// now get all uid's and displaynames this user is eligable to share with
		$sharingAllowed = \OC::$server->getConfig()->getAppValue('core', 'shareapi_enabled', 'yes') == 'yes';
		if ($sharingAllowed) {
			$hasLDAP = (\OC::$server->getUserSession()->getUser()->getBackendClassName() == 'LDAP');
			$onlyShareWithOwnGroup = \OC::$server->getConfig()->getAppValue('core', 'shareapi_only_share_with_group_members', 'no') == 'yes';
			if ($hasLDAP) {
				$sql = $sql . 'UNION ALL ' .
						'SELECT  ' .
							"'0' AS id, " .
							'directory_uuid AS user_id, ' .
							'NULL AS loginname, ' .
							'owncloud_name AS website, ' .
							'NULL AS address, ' .
							'NULL AS pass, ' .
							'NULL AS properties, ' .
							'NULL AS notes, ' .
							'NULL AS creation_date, ' .
							'NULL AS deleted ' .
						'FROM *PREFIX*ldap_user_mapping ';
			}
			if ($onlyShareWithOwnGroup) {
				$sql = $sql . 'UNION ALL ' .
					'SELECT  ' .
						'DISTINCT CAST(displaynames.uid AS CHAR) AS id, ' .
						'displaynames.displayname AS user_id, ' .
						'NULL AS loginname, ' .
						'displaynames.uid AS website, ' .
						'NULL AS address, ' .
						'NULL AS pass, ' .
						'NULL AS properties, ' .
						'NULL AS notes, ' .
						'NULL AS creation_date, ' .
						'NULL AS deleted ' .
					'FROM *PREFIX*group_user AS users ' .
						'LEFT JOIN  ' .
						'(SELECT CAST(uid AS CHAR) AS uid, CASE WHEN displayname IS NULL THEN uid ELSE displayname END AS displayname FROM *PREFIX*users) AS displaynames ON users.uid = displaynames.uid  ' .
					'WHERE gid IN (SELECT DISTINCT gid FROM *PREFIX*group_user WHERE uid = ?) ';
			} else {
				$sql = $sql . 'UNION ALL ' .
					'SELECT  ' .
						'uid AS id, ' .
						'CASE WHEN displayname IS NULL THEN uid ELSE displayname END AS user_id, ' .
						'NULL AS loginname, ' .
						'uid AS website, ' .
						'NULL AS address, ' .
						'NULL AS pass, ' .
						'NULL AS properties, ' .
						'NULL AS notes, ' .
						'NULL AS creation_date, ' .
						'NULL AS deleted ' .
					'FROM *PREFIX*users ';
			}
		}

		// fix for PostgreSQL, cannot use UNION and ORDER BY in same query hierarchy
		$sql = 'SELECT * FROM (' . $sql . ') AS t1';

		// order by website according to database used
		$dbtype = \OC::$server->getConfig()->getSystemValue('dbtype', 'sqlite3');
		if ($dbtype == 'mysql') {
			$sql = $sql . ' ORDER BY LOWER(website) COLLATE utf8_general_ci ASC';
		} else if ($dbtype == 'sqlite' OR $dbtype == 'sqlite3') {
			$sql = $sql . ' ORDER BY website COLLATE NOCASE';
		} else {
			$sql = $sql . ' ORDER BY LOWER(website) ASC';
		}
		
		if ($onlyShareWithOwnGroup) {
			return $this->findEntities($sql, [$userId, $userId, $userId]);
		} else {
			return $this->findEntities($sql, [$userId, $userId]);
		}
	}

	public function isShared($pwid) {
		// checks if passwords is already shared
		$sql = "SELECT SUM(CASE WHEN pwid = ? AND sharedto <> '' THEN 1 ELSE 0 END) AS count FROM *PREFIX*passwords_share";
		$sql = $this->db->prepare($sql);
		$sql->bindParam(1, $pwid, \PDO::PARAM_INT);
		$sql->execute();
		$row = $sql->fetch();
		$sql->closeCursor();
		return (int) $row['count'];
	}

	public function isTrashed($pwid) {
		// checks if passwords is already shared
		$sql = 'SELECT SUM(CASE WHEN id = ? AND deleted = 1 THEN 1 ELSE 0 END) AS count FROM *PREFIX*passwords';
		$sql = $this->db->prepare($sql);
		$sql->bindParam(1, $pwid, \PDO::PARAM_INT);
		$sql->execute();
		$row = $sql->fetch();
		$sql->closeCursor();
		return (int) $row['count'];
	}

	public function isSharedWithUser($pwid, $shareduserid) {
		// checks if passwords is already shared with a specific user
		$sql = 'SELECT SUM(CASE WHEN pwid = ? AND sharedto = ? THEN 1 ELSE 0 END) AS count FROM *PREFIX*passwords_share';
		$sql = $this->db->prepare($sql);
		$sql->bindParam(1, $pwid, \PDO::PARAM_INT);
		$sql->bindParam(2, $shareduserid, \PDO::PARAM_STR);
		$sql->execute();
		$row = $sql->fetch();
		$sql->closeCursor();
		return (int) $row['count'];
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
