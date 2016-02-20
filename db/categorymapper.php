<?php
namespace OCA\Passwords\Db;

use OCP\IDb;
use OCP\AppFramework\Db\Mapper;

class CategoryMapper extends Mapper {

	public function __construct(IDb $db) {
		parent::__construct($db, 'passwords_categories', '\OCA\Passwords\Db\Category');
	}

	public function find($id, $userId) {
		$sql = 'SELECT * FROM *PREFIX*passwords_categories WHERE id = ? AND user_id = ?';
		return $this->findEntity($sql, [$id, $userId]);
	}

	public function findAll($userId) {
		$sql = 'SELECT * FROM *PREFIX*passwords_categories WHERE user_id = ? ORDER BY LOWER(category_name) COLLATE utf8_general_ci ASC';
		return $this->findEntities($sql, [$userId]);
	}
}
