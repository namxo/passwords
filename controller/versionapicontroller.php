<?php
namespace OCA\Passwords\Controller;

use \OCP\IRequest;
use \OCP\AppFramework\Http\DataResponse;
use \OCP\AppFramework\ApiController;
use \OCP\App;

class VersionApiController extends ApiController {

        use Errors;

        public function __construct($AppName, IRequest $request) {
                // allow getting passwords and editing/saving them
                parent::__construct(
                        $AppName,
                        $request,
                        'GET',
                        'Authorization, Content-Type, Accept',
                        86400);
        }

        /**
         * @CORS
         * @NoCSRFRequired
         * @NoAdminRequired
         */
        public function index() {
                $AppInstance = new App();
                return new DataResponse($AppInstance->getAppInfo("passwords")["version"]);
        }
}
