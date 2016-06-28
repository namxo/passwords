<div class="section" id="passwords-admin">
	<div 
		id="password-settings" 
		root-folder="<?php p(OC::$SERVERROOT) ?>"
		app-path="<?php p(OC::$server->getConfig()->getAppValue('passwords', 'app_path', OC::$SERVERROOT.'/apps')) ?>" >
	</div>
	<h2><?php p($l->t('Passwords')); ?></h2>

	<div>
		<h3><?php p($l->t('App location')); ?></h3>
		<label> 
			<?php p($l->t('App location')); ?>: <input type="text" id="app_path" value=""> /passwords
			<p class="descr">
			<em><?php p($l->t('Change this to support other app folders')); ?>.<br>
				<?php p($l->t('An invalid folder name will break the app and these settings too! The value is saved to the database table %s', "`oc_appconfig`.`configkey` = 'app_path'")); ?>.</em>
		</p>
		</label>
	</div>

	<div>
		<h3><?php p($l->t('Security')); ?></h3>

		<label>
		<input class="checkbox" type="checkbox" id="https_check">
		<label for="https_check"><?php p($l->t('Block app when not connected to %s using a secured connection', array($theme->getName()))); ?></label>
		<p class="descr">
			<em class="https_warning"><?php p($l->t('Turning this off is HIGHLY DISCOURAGED')); ?>.</em>
		</p>

		<input class="checkbox" type="checkbox" id="backup_allowed">
		<label for="backup_allowed"><?php p($l->t('Allow users to download a backup as an unencrypted, plain text file')); ?></label>

		<br>

		<input class="checkbox" type="checkbox" id="disable_contextmenu">
		<label for="disable_contextmenu"><?php p($l->t('Disable browsers context menu')); ?></label>
		<p class="descr">
			<em><?php p($l->t('This will make it harder for users to use the functions of the browsers context menu, but it may really be annoying to some users')); ?>.</em>
		</p>
	</div>

	<div>
		<h3><?php p($l->t('Website icons')); ?></h3>
		<input class="checkbox" type="checkbox" id="icons_allowed">
		<label for="icons_allowed"><?php p($l->t('Allow website icons')); ?></label>
		<p class="descr">
			<em><?php p($l->t('This will help users finding a website they are looking for in their list and it looks rather nice too, but it will send your IP address to another server')); ?>.</em>
		</p>
		<div>
			<input class="radio" type="radio" id="ddg_value" name="icons_service_grp">
			<label for="ddg_value"><?php p($l->t('Use DuckDuckGo')); ?></label>
			<br>
			<input class="radio" type="radio" id="ggl_value" name="icons_service_grp"> 
			<label for="ggl_value"><?php p($l->t('Use Google')); ?></label>
			<p class="descr radiotext">
				<?php p($l->t("Google DOES track your moves. Use DuckDuckGo preferably, since they don't")); ?>: <a class="linkDDG" href="http://donttrack.us" target="_blank">http://donttrack.us</a>.
			</p>
		</div>
	</div>

	<div>
		<h3><?php p($l->t('Colour of password date')); ?></h3>
		<label> 
			<green><?php p($l->t('Green') . ': 0 ' . $l->t('to')); ?> <input type="text" id="days_orange" class="fieldDays" value=""> <?php p($l->t('days')); ?></green>
		</label>
		<br>
		<label> 
			<orange id="daysOrange"></orange> <input type="text" id="days_red" class="fieldDays" value=""> <orange><?php p($l->t('days')); ?></orange>
		</label>
		<br>
		<label>
			<red id="daysRed"></red>
		</label>
	</div>

	<span class="msg-passwords"></span>

</div>
