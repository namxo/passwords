<?php 
	$class = '';
	if (OC::$server->getConfig()->getUserValue(OC::$server->getUserSession()->getUser()->getUID(), 'passwords', 'master_password', '0') == '0') {
		$class = 'hide_old_pass';
	}
?>
<div class="section" id="passwords-personal">
	<div 
		id="password-settings" 
		root-folder="<?php p(OC::$SERVERROOT) ?>"
		app-path="<?php p(OC::$server->getConfig()->getAppValue('passwords', 'app_path', OC::$SERVERROOT.'/apps')) ?>" >
	</div>

	<h2><?php p($l->t('Passwords')); ?></h2>

	<div>
		<input class="checkbox" type="checkbox" id="timer_bool">
		<label for="timer_bool"><?php p($l->t('Use inactivity countdown')); ?></label>
		<label>
			<input type="text" id="timer" value="0"> <em id="timersettext"> <?php p($l->t('seconds')); ?> </em>
		</label>
		<p>
			<?php p($l->t("This will put a timer on the lower right of the screen, which resets on activity.") . " " . $l->t("You will be logged off automatically when this countdown reaches 0") . ", " . " " . $l->t("or (if you've set an extra authentication password) the app will be locked down")); ?>.
		</p>
		<p>
			<?php p($l->t("Setting a countdown will log you off too when your session cookie ends (set to %s seconds by your administrator)", \OC::$server->getConfig()->getSystemValue('session_lifetime', 60*15))); ?>.
		</p>
	</div>

	<hr>

	<div id="icons_show_div">
		<input class="checkbox" type="checkbox" id="icons_show">
		<label for="icons_show"><?php p($l->t('Show website icons')); ?></label>
		<br>
	</div>

	<hr>

	<div>
		<input class="checkbox" type="checkbox" id="hide_usernames">
		<label for="hide_usernames"><?php p($l->t('Hide usernames')); ?></label>
		<br>
		<input class="checkbox" type="checkbox" id="hide_passwords">
		<label for="hide_passwords"><?php p($l->t('Hide passwords')); ?></label>
		<p>
			<?php p($l->t("This will show values as '*****', so you will need to click on a value to actually view it. This is useful to prevent others from making screenshots or taking photos of your password list")); ?>. 
			<br>
			<?php p($l->t("Note: the search function will not work on hidden values")); ?>.
		</p>
	</div>

	<hr>

	<div>
		<input class="checkbox" type="checkbox" id="hide_attributes">
		<label for="hide_attributes"><?php p($l->t('Hide columns') . " '" . strtolower($l->t('Strength')) . "'/'" . strtolower($l->t('Last changed')) . "'"); ?></label>
		<br>
	</div>

	<span class="msg-passwords"></span>

</div>
