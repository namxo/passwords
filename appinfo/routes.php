<?php
return [
	'resources' => [
		'category' => ['url' => '/categories'],
		'password' => ['url' => '/passwords'],
		'category_api' => ['url' => '/api/0.1/categories'],
		'password_api' => ['url' => '/api/0.1/passwords'],
		'version_api' => ['url' => '/api/0.1/version']
	],
	'routes' => [
		['name' => 'settings#set', 'url' => '/settings/{setting}/{value}', 'verb' => 'POST'],
		['name' => 'settings#setadmin', 'url' => '/settings/{setting}/{value}/{admin1}/{admin2}', 'verb' => 'POST'],
		['name' => 'settings#get', 'url' => '/settings', 'verb' => 'GET'],
		['name' => 'auth#checkauth', 'url' => '/auth/{pass}/{type}', 'verb' => 'POST'],
		['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
		['name' => 'password_api#preflighted_cors', 'url' => '/api/0.1/{path}',
		 'verb' => 'OPTIONS', 'requirements' => ['path' => '.+']]
	]
];
