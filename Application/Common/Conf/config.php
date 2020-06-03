<?php

return array(
	'DB_TYPE'              => DB_TYPE,
	'DB_HOST'              => DB_HOST,
	'DB_NAME'              => DB_NAME,
	'DB_USER'              => DB_USER,
	'DB_PWD'               => DB_PWD,
	'DB_PORT'              => DB_PORT,
	'DB_PREFIX'            => 'mollymobi_',
	'DB_Chat' => array(
	
			'db_type' => DB_TYPE,
	
			'db_host' => '127.0.0.1',
	
			'db_name' => DB_NAME,
	
			'db_user' => DB_USER,
	
			'db_pwd' => DB_PWD,
	
			'db_port' => '3306',
	
	),
	'ACTION_SUFFIX'        => '',
	'MULTI_MODULE'         => true,
	'MODULE_DENY_LIST'     => array('Common', 'Runtime'),
	'MODULE_ALLOW_LIST'    => array('Home', 'Admin'),
	'DEFAULT_MODULE'       => 'Home',
	'URL_CASE_INSENSITIVE' => false,
	'URL_MODEL'            => 2,
	'URL_HTML_SUFFIX'      => 'html',
	'UPDATE_PATH'          => '',
	'CLOUD_PATH'           => '',
    'HOST_IP'	=> '',
	'TMPL_CACHFILE_SUFFIX' =>'.html',
	'DATA_CACHE_TYPE'      => 'file',
	'URL_PARAMS_SAFE'	   => true,
	'URL_PARAMS_FILTER'    => true,
	'DEFAULT_FILTER'       =>'check_mollymobi,htmlspecialchars,strip_tags',
	'URL_PARAMS_FILTER_TYPE' =>'check_mollymobi,htmlspecialchars,strip_tags',
	);
?>