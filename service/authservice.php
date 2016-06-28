<?php
namespace OCA\Passwords\Service;

use OCP\IConfig;

class AuthService {

	private $userId;
	private $auth;
	private $appName;

	public function __construct($UserId, IConfig $auth, $AppName) {
		$this->userId = $UserId;
		$this->auth = $auth;
		$this->appName = $AppName;
	}

	public function checkauth($pass, $type) {

		$result = false;

		if ($type == 'owncloud') {
			$result = (\OC::$server->getUserManager()->checkPassword($this->userId, $pass) != false);
			// on fail, OC will add an entry to the log, so clarify that:
			if ($result == false) {
				\OCP\Util::writeLog('passwords', "Authentication failed: '" . $this->userId . "'", \OCP\Util::WARN);
			}
		} 
		
		if ($type == 'master') {
			$master = \OC::$server->getConfig()->getUserValue($this->userId, 'passwords', 'master_password', '0');
			$result = ($master == hash('sha512', $pass));
		}
		
		if ($result == true) {
			return 'pass';
		} else {
			return 'fail';
		}
	}
}
