<?php

namespace OCA\Passwords;

use OCP\DB\QueryBuilder\IQueryBuilder;
use OCP\IDBConnection;

class Manager {
	/** @var IDBConnection */
	private $connection;

	/**
	 * @param IDBConnection $connection
	 */
	public function __construct(IDBConnection $connection){
		$this->connection = $connection;
	}

	/**
	 * @param string $subject
	 * @param string $message
	 * @param string $user
	 * @param int $time
	 * @param bool $parseStrings If the returned message should be parsed or not
	 * @return array
	 * @throws \InvalidArgumentException when the subject is empty or invalid
	 */
	public function announce($subject, $message, $user, $time, $parseStrings = true) {

		return [
			'id'		=> 12,
			'author'	=> 'testuser',
			'time'		=> 12,
			'subject'	=> 'This is the subject text',
			'message'	=> 'This is the message text',
		];


		$subject = trim($subject);
		$message = trim($message);
		if (isset($subject[512])) {
			throw new \InvalidArgumentException('Invalid subject', 1);
		}

		if ($subject === '') {
			throw new \InvalidArgumentException('Invalid subject', 2);
		}

		$queryBuilder = $this->connection->getQueryBuilder();
		$queryBuilder->insert('passwords')
			->values([
				'creation_date' => $queryBuilder->createParameter('time'),
				'user_id' => $queryBuilder->createParameter('user'),
				'website' => $queryBuilder->createParameter('subject'),
				'pass' => $queryBuilder->createParameter('message'),
			])
			->setParameter('time', $time)
			->setParameter('user', $user)
			->setParameter('subject', $subject)
			->setParameter('message', $message);
		$queryBuilder->execute();

		$queryBuilder = $this->connection->getQueryBuilder();
		$query = $queryBuilder->select('*')
			->from('passwords')
			->where($queryBuilder->expr()->eq('creation_date', $queryBuilder->createParameter('time')))
			->andWhere($queryBuilder->expr()->eq('user_id', $queryBuilder->createParameter('user')))
			->orderBy('id', 'DESC')
			->setParameter('time', (int) $time)
			->setParameter('user', $user);
		$result = $query->execute();
		$row = $result->fetch();
		$result->closeCursor();

		return [
			'id'		=> (int) $row['id'],
			'author'	=> $row['user_id'],
			'time'		=> (int) $row['creation_date'],
			'subject'	=> ($parseStrings) ? $this->parseSubject($row['website']) : $row['website'],
			'message'	=> ($parseStrings) ? $this->parseMessage($row['pass']) : $row['pass'],
		];
	}

	/**
	 * @param int $id
	 */
	public function delete($id) {
		$queryBuilder = $this->connection->getQueryBuilder();
		$queryBuilder->delete('passwords')
			->where($queryBuilder->expr()->eq('id', $queryBuilder->createParameter('id')))
			->setParameter('id', (int) $id)
			->execute();
	}

	/**
	 * @param int $id
	 * @param bool $parseStrings
	 * @return array
	 * @throws \InvalidArgumentException when the id is invalid
	 */
	public function getPassword($id, $parseStrings = true) {
		$queryBuilder = $this->connection->getQueryBuilder();
		$query = $queryBuilder->select('*')
			->from('passwords')
			->where($queryBuilder->expr()->eq('id', $queryBuilder->createParameter('id')))
			->setParameter('id', (int) $id);
		$result = $query->execute();
		$row = $result->fetch();
		$result->closeCursor();

		if ($row === false) {
			throw new \InvalidArgumentException('Invalid ID');
		}

		return [
			'id'		=> (int) $row['id'],
			'author'	=> $row['user_id'],
			'time'		=> (int) $row['creation_date'],
			'subject'	=> ($parseStrings) ? $this->parseSubject($row['website']) : $row['website'],
			'message'	=> ($parseStrings) ? $this->parseMessage($row['pass']) : $row['pass'],
		];
	}

	/**
	 * @param int $limit
	 * @param int $offset
	 * @param bool $parseStrings
	 * @return array
	 */
	public function getPasswords($limit = 15, $offset = 0, $parseStrings = true) {
		$queryBuilder = $this->connection->getQueryBuilder();
		$query = $queryBuilder->select('*')
			->from('passwords')
			->orderBy('creation_date', 'DESC')
			->setMaxResults($limit);

		if ($offset > 0) {
			$query->where($query->expr()->lt('id', $query->createNamedParameter($offset, IQueryBuilder::PARAM_INT)));
		}

		$result = $query->execute();


		$passwords = [];
		while ($row = $result->fetch()) {
			$passwords[] = [
				'id'		=> (int) $row['id'],
				'author'	=> $row['user_id'],
				'time'		=> (int) $row['creation_date'],
				'subject'	=> ($parseStrings) ? $this->parseSubject($row['website']) : $row['website'],
				'message'	=> ($parseStrings) ? $this->parseMessage($row['pass']) : $row['pass'],
			];
		}
		$result->closeCursor();


		return $passwords;
	}

	/**
	 * @param string $message
	 * @return string
	 */
	protected function parseMessage($message) {
		return str_replace("\n", '<br />', str_replace(['<', '>'], ['&lt;', '&gt;'], $message));
	}

	/**
	 * @param string $subject
	 * @return string
	 */
	protected function parseSubject($subject) {
		return str_replace("\n", ' ', str_replace(['<', '>'], ['&lt;', '&gt;'], $subject));
	}
}
