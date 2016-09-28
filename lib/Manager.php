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
				'password_time' => $queryBuilder->createParameter('time'),
				'password_user' => $queryBuilder->createParameter('user'),
				'password_subject' => $queryBuilder->createParameter('subject'),
				'password_message' => $queryBuilder->createParameter('message'),
			])
			->setParameter('time', $time)
			->setParameter('user', $user)
			->setParameter('subject', $subject)
			->setParameter('message', $message);
		$queryBuilder->execute();

		$queryBuilder = $this->connection->getQueryBuilder();
		$query = $queryBuilder->select('*')
			->from('passwords')
			->where($queryBuilder->expr()->eq('password_time', $queryBuilder->createParameter('time')))
			->andWhere($queryBuilder->expr()->eq('password_user', $queryBuilder->createParameter('user')))
			->orderBy('password_id', 'DESC')
			->setParameter('time', (int) $time)
			->setParameter('user', $user);
		$result = $query->execute();
		$row = $result->fetch();
		$result->closeCursor();

		return [
			'id'		=> (int) $row['password_id'],
			'author'	=> $row['password_user'],
			'time'		=> (int) $row['password_time'],
			'subject'	=> ($parseStrings) ? $this->parseSubject($row['password_subject']) : $row['password_subject'],
			'message'	=> ($parseStrings) ? $this->parseMessage($row['password_message']) : $row['password_message'],
		];
	}

	/**
	 * @param int $id
	 */
	public function delete($id) {
		$queryBuilder = $this->connection->getQueryBuilder();
		$queryBuilder->delete('passwords')
			->where($queryBuilder->expr()->eq('password_id', $queryBuilder->createParameter('id')))
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
			->where($queryBuilder->expr()->eq('password_id', $queryBuilder->createParameter('id')))
			->setParameter('id', (int) $id);
		$result = $query->execute();
		$row = $result->fetch();
		$result->closeCursor();

		if ($row === false) {
			throw new \InvalidArgumentException('Invalid ID');
		}

		return [
			'id'		=> (int) $row['password_id'],
			'author'	=> $row['password_user'],
			'time'		=> (int) $row['password_time'],
			'subject'	=> ($parseStrings) ? $this->parseSubject($row['password_subject']) : $row['password_subject'],
			'message'	=> ($parseStrings) ? $this->parseMessage($row['password_message']) : $row['password_message'],
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
			->orderBy('password_time', 'DESC')
			->setMaxResults($limit);

		if ($offset > 0) {
			$query->where($query->expr()->lt('password_id', $query->createNamedParameter($offset, IQueryBuilder::PARAM_INT)));
		}

		$result = $query->execute();


		$passwords = [];
		while ($row = $result->fetch()) {
			$passwords[] = [
				'id'		=> (int) $row['password_id'],
				'author'	=> $row['password_user'],
				'time'		=> (int) $row['password_time'],
				'subject'	=> ($parseStrings) ? $this->parseSubject($row['password_subject']) : $row['password_subject'],
				'message'	=> ($parseStrings) ? $this->parseMessage($row['password_message']) : $row['password_message'],
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
