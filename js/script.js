(function(OC, window, $, undefined) {
	'use strict';

	$(document).ready(function() {

		$(document.body).click(function(e){
			var $command_box = $('#commands_popup');
			if (!$command_box.has(e.target).length) { // if the click was not within $command_box
				//$command_box.hide();
				$command_box.slideUp(100);
				$('.activerow').removeClass('activerow');
			}
			
		});

		// this passwords object holds all our passwords
		var Passwords = function(baseUrl) {
			this._baseUrl = baseUrl;
			this._passwords = [];
			this._activePassword = undefined;
		};

		Passwords.prototype = {
			load: function(id) {
				var self = this;
				this._passwords.forEach(function(password) {
					if (password.id === id) {
						password.active = true;
						self._activePassword = password;
					} else {
						password.active = false;
					}
				});
			},
			getActive: function() {
				return this._activePassword;
			},
			removeActive: function() {
				var index;
				var deferred = $.Deferred();
				var id = this._activePassword.id;
				this._passwords.forEach(function(password, counter) {
					if (password.id === id) {
						index = counter;
					}
				});

				if (index !== undefined) {
					// delete cached active password if necessary
					if (this._activePassword === this._passwords[index]) {
						delete this._activePassword;
					}

					this._passwords.splice(index, 1);

					$.ajax({
						url: this._baseUrl + '/' + id,
						method: 'DELETE'
					}).done(function() {
						deferred.resolve();
					}).fail(function() {
						deferred.reject();
					});
				} else {
					deferred.reject();
				}
				return deferred.promise();
			},
			removeByID: function(id) {
				var index = id;
				var deferred = $.Deferred();
				
				if (index !== undefined) {
					// delete cached active password if necessary
					if (this._activePassword === this._passwords[index]) {
						delete this._activePassword;
					}

					this._passwords.splice(index, 1);

					$.ajax({
						url: this._baseUrl + '/' + id,
						method: 'DELETE'
					}).done(function() {
						deferred.resolve();
					}).fail(function() {
						deferred.reject();
					});
				} else {
					deferred.reject();
				}
				return deferred.promise();
			},
			create: function(password) {

				var deferred = $.Deferred();

				$.ajax({
					url: this._baseUrl,
					method: 'POST',
					contentType: 'application/json',
					data: JSON.stringify(password)
				}).done(function(password) {
					deferred.resolve();
				}).fail(function() {
					deferred.reject();
				});
				return deferred.promise();
			},
			getAll: function() {
				return this._passwords;
			},
			loadAll: function() {
				var deferred = $.Deferred();
				var self = this;
				$.get(this._baseUrl).done(function(passwords) {
					self._activePassword = undefined;
					self._passwords = passwords;
					deferred.resolve();
				}).fail(function() {
					deferred.reject();
				});
				return deferred.promise();
			},
			updateActive: function(index, loginname, website, address, pass, notes, category, deleted, changedDate) {
				
				if (changedDate == undefined) {
					var d = new Date();
					// date as YYYY-MM-DD
					var changedDate = d.getFullYear()
						+ '-' + ('0' + (d.getMonth() + 1)).slice(-2)
						+ '-' + ('0' + d.getDate()).slice(-2)
				}

				if (!pass) {
					pass = ' ';
				}
				var password = {
					'id' : index,
					'website': website,
					'loginname': '',
					'address': '',
					'pass': pass,
					'properties': 
						'"loginname" : "' + loginname + '", ' +
						'"address" : "' + address + '", ' +
						'"strength" : "' + strength_func(pass) + '", ' +
						'"length" : "' + pass.length + '", ' +
						'"lower" : "' + ~~strHasLower(pass) + '", ' +
						'"upper" : "' + ~~strHasUpper(pass) + '", ' +
						'"number" : "' + ~~strHasNumber(pass) + '", ' +
						'"special" : "' + ~~strHasSpecial(pass) + '", ' +
						'"category" : "' + category + '", ' +
						'"datechanged" : "' + changedDate + '", ' +
						'"notes" : "' + notes + '"',
					'notes': '',
					'deleted': deleted
				};

				return $.ajax({
					url: this._baseUrl + '/' + password.id,
					method: 'PUT',
					contentType: 'application/json',
					data: JSON.stringify(password)
				});
			}
		};

		// this categories object holds all our categories
		var Categories = function(baseUrl) {
			this._baseUrl = baseUrl;
			this._categories = [];
		};

		Categories.prototype = {
			load: function(id) {
				var self = this;
				this._categories.forEach(function(category) {
					if (category.id === id) {
						category.active = true;
						self._activecategory = category;
					} else {
						category.active = false;
					}
				});
			},
			removeByID: function(id) {
				var index = id;
				var deferred = $.Deferred();
				
				if (index !== undefined) {

					this._categories.splice(index, 1);

					$.ajax({
						url: this._baseUrl + '/' + id,
						method: 'DELETE'
					}).done(function() {
						deferred.resolve();
					}).fail(function() {
						deferred.reject();
					});
				} else {
					deferred.reject();
				}
				return deferred.promise();
			},
			create: function(category) {
				var deferred = $.Deferred();

				$.ajax({
					url: this._baseUrl,
					method: 'POST',
					contentType: 'application/json',
					data: JSON.stringify(category)
				}).done(function(category) {
					deferred.resolve();
				}).fail(function() {
					deferred.reject();
				});
				return deferred.promise();
			},
			getAll: function() {
				return this._categories;
			},
			loadAll: function() {
				var deferred = $.Deferred();
				var self = this;
				$.get(this._baseUrl).done(function(categories) {
					self._categories = categories;
					deferred.resolve();
				}).fail(function() {
					deferred.reject();
				});
				return deferred.promise();
			}
		};

		// this holds our settings
		var Settings = function(baseUrl) {
			this._baseUrl = baseUrl;
			this._settings = [];
		};

		Settings.prototype = {
			load: function() {
				var deferred = $.Deferred();
				var self = this;
				$.ajax({
					url: this._baseUrl,
					method: 'GET',
					async: false
				}).done(function( settings ) {
					self._settings = settings;
				}).fail(function() {
					deferred.reject();
				});
				return deferred.promise();
			},
			getKey: function(key) {
				for (var k in this._settings)
				{
					if (k == key)
						return this._settings[k];
				}
			},
			getAll: function() {
				return this._settings;
			}
		};

		// this will be the view that is used to update the html
		var View = function(passwords) {
			this._passwords = passwords;
		};

		View.prototype = {
			renderContent: function() {
				var source_passwords = $('#template-passwords-old').html();
				var template_passwords = Handlebars.compile(source_passwords);
				var html_passwords = template_passwords({
					passwords: this._passwords.getAll()
				});
				$('#PasswordsTableTestOld').html(html_passwords);

				// check for legacy versions, where loginname and notes (and so forth) weren't included in the db properties column yet
				// prior to v17
				var table = document.getElementById('PasswordsTableTestOld');
				if (table) {
					for (var i = 0; i < table.rows.length; i++) {
						// test for login names, should not exist since they're serialized in properties column
						if (table.rows[i].cells[1].textContent != '') {
							var updateReq = true;
						}
					}
					if (updateReq) {
						$('#update_start_btn').click(function() {
							updateStart(passwords);
						});
						updateRequired();
						return false;
					} else {
						$('#PasswordsTableTestOld').hide();
						// following doesn't work on IE7
						$('#PasswordsTableTestOld').remove();
					}
				}

				// building new table
				source_passwords = $('#template-passwords-serialize').html();
				template_passwords = Handlebars.compile(source_passwords);
				var html_passwords_serialize = template_passwords({
					passwords: this._passwords.getAll()
				});

				html_passwords_serialize = html_passwords_serialize.replace(/&quot;/g, '"');
				var rows = html_passwords_serialize.split('<br>');

				//$('#PasswordsTableContent').html(html_passwords_serialize);
				
				formatTable(false, rows);

				$('tr').click(function(event) {
					$("tr").removeClass("activerow");
				});

				$('.btn_commands_open').click(function(event) {
					event.stopPropagation(); // or else this will hide the box
					$("tr").removeClass("activerow");

					if ($('#commands_popup').css('display') == 'block') {
						$('#commands_popup').slideUp(150);
						return false;
					}

					var $row = $(this).closest("tr");
					var $cell = $(this).closest("td");
					$row.attr("class", "activerow");
					$('#commands_popup').hide();

					// set values
					var id = $row.attr("attr_id");
					var type = $cell.attr("type");
					var value = $row.attr("attr_" + type);
					var website = $row.attr("attr_website");
					var user = $row.attr("attr_loginname");
					var pass = $row.attr("attr_pass");
					var notes = $row.attr("attr_notes");
					var category = $row.attr("attr_category");
					var deleted = $row.hasClass("is_deleted");
					$('#cmd_id').val(id);
					$('#cmd_type').val(type);
					$('#cmd_value').val(value);
					$('#cmd_website').val(website);
					$('#cmd_loginname').val(user);
					$('#cmd_pass').val(pass);
					$('#cmd_notes').val(notes);
					$('#cmd_category').val(category);
					$('#cmd_deleted').val(deleted);
					if (type == 'website') {
						$('#cmd_address').val($row.attr("attr_address"));
					} else {
						$('#cmd_address').val('');
					}
					if ($('#app-navigation').css('position') == 'absolute') {
						var left = $(this).position().left;
					} else {
						var left = $(this).position().left + $('#app-navigation').width();
					}
					left = left + $('.btn_commands_open').width() - ($('#commands_popup').width() / 2);
					var top = $(this).position().top + $('#header').height() + 25;
					$('#commands_popup').css('left', left + 'px');
					$('#commands_popup').css('top', top + 'px');
					$('#commands_popup').slideDown(150);
				});

				// colour picker from the great https://github.com/bgrins/spectrum
				$("#colorpicker").spectrum({
					color: '#eeeeee',
					showInput: true,
					showButtons: false,
					showInitial: false,
					allowEmpty: false,
					showAlpha: false,
					showPalette: true,
					showPaletteOnly: false,
					togglePaletteOnly: false,
					showSelectionPalette: false,
					clickoutFiresChange: true,
					hideAfterPaletteSelect: true,
					containerClassName: 'category_colorpicker',
					replacerClassName: 'category_colorpicker',
					preferredFormat: 'hex',
					palette: [
						["#000000","#444444","#666666","#999999","#cccccc","#eeeeee","#f3f3f3","#ffffff"],
						["#ff0000","#ff9900","#ffff00","#00ff00","#00ffff","#0000ff","#9900ff","#ff00ff"],
						["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
						["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
						["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
						["#cc0000","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
						["#990000","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
						["#660000","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
					],
					move: function(color) {
						$('#cat_colour').val(color.toHexString());
					},
					change: function(color) {
						$('#cat_colour').val(color.toHexString());
					},
					hide: function(color) {
						$('#cat_colour').val(color.toHexString());
					}
				});

				// use ZeroClipboard to copy the password
				$('#app-settings').attr("ZeroClipboard", isFlashEnabled());

				if ($('#app-settings').attr("ZeroClipboard") == 'true') {
					var client = new ZeroClipboard($('#btn_copy'));
					client.on( 'ready', function(event) {
						client.on( 'copy', function(event) {
							event.clipboardData.setData('text/plain', $('#cmd_value').val());
						});
						client.on( 'aftercopy', function(event) {
							//alert('Copied text to clipboard: ' + event.data['text/plain']);
							$('#zeroclipboard_copied').slideDown(50);
							setTimeout(function() {
								$('#zeroclipboard_copied').slideUp(100);
							}, 1500); 
						});
					});
					client.on('error', function(event) {
						//alert('Clipboard error: "' + event.name + '" - ' + event.message);
						$('#app-settings').attr("ZeroClipboard", false);
						ZeroClipboard.destroy();
					});
				} else {
					$('#btn_copy').click(function() {
						window.prompt($('#cmd_value').val());
					});
				}
				
				$('#btn_edit').click(function() {
					var typeVar = '';
					var typeTitle = '';
					switch ($('#cmd_type').val()) {
						case 'website':
							typeVar = 'website';
							typeTitle = t('passwords', 'Website or company');
							break;
						case 'loginname':
							typeVar = 'loginname';
							typeTitle = t('passwords', 'Login name');
							break;
						case 'pass':
							typeVar = 'password';
							typeTitle = t('passwords', 'Password');
							break;
					}
					popUp(typeTitle, $('#cmd_value').val(), typeVar, $('#cmd_address').val(), $('#cmd_website').val(), $('#cmd_loginname').val());
					$('#accept').click(function() {
						var newvalue = $('#new_value_popup').val();

						if (typeVar == 'website') {
							if ($('#new_address_popup').val() != '' 
								&& $('#new_address_popup').val().substring(0,7).toLowerCase() != 'http://' 
								&& $('#new_address_popup').val().substring(0,8).toLowerCase() != 'https://'
								&& $('#new_address_popup').val().substring(0,4).toLowerCase() != 'www.') 
							{
								if (isUrl($('#new_address_popup').val())) {
									// valid URL, so add http
									$('#new_address_popup').val('http://' + $('#new_address_popup').val());
									// now check if valid
									if (!isUrl($('#new_address_popup').val())) {
										$('#popupInvalid').show();
										$('#new_address_popup').select();
										return false;
									}
								} else {
									$('#popupInvalid').show();
									$('#new_address_popup').select();
									return false;
								}
							}

							var newaddress = $('#new_address_popup').val();
						}

						var passwords = new Passwords(OC.generateUrl('/apps/passwords/passwords'));

						if ($('#keep_old_popup').prop('checked') == true) {
							// save row to trash bin first
							var d = new Date();
							// date as YYYY-MM-DD
							var changedDate = d.getFullYear()
								+ '-' + ('0' + (d.getMonth() + 1)).slice(-2)
								+ '-' + ('0' + d.getDate()).slice(-2)
							var pass_old = $('#cmd_pass').val();
							var password = {
								'website': $('#cmd_website').val(),
								'pass': pass_old,
								'properties': 
									'"loginname" : "' + $('#cmd_loginname').val() + '", ' +
									'"address" : "' + $('#cmd_address').val() + '", ' +
									'"strength" : "' + strength_func(pass_old) + '", ' +
									'"length" : "' + pass_old.length + '", ' +
									'"lower" : "' + ~~strHasLower(pass_old) + '", ' +
									'"upper" : "' + ~~strHasUpper(pass_old) + '", ' +
									'"number" : "' + ~~strHasNumber(pass_old) + '", ' +
									'"special" : "' + ~~strHasSpecial(pass_old) + '", ' +
									'"category" : "' + $('#cmd_category').val() + '", ' +
									'"datechanged" : "' + changedDate + '", ' +
									'"notes" : "' + $('#cmd_notes').val() + '"',
								'deleted': '1'
							};
							passwords.create(password).done(function() {
								var passwords2 = new Passwords(OC.generateUrl('/apps/passwords/passwords'));
								var view = new View(passwords2);
								passwords2.loadAll().done(function() {
									view.renderContent();
								});
							}).fail(function() {
								OCdialogs.alert(t('passwords', 'Error: Could not create password.'), t('passwords', 'Save'), null, true);
								return false;
							});
						}

						// overwrite proper field(s) with new value(s)
						switch (typeVar) {
							case 'website':
								$('#cmd_website').val(newvalue);
								$('#cmd_address').val(newaddress);
								break;
							case 'loginname':
								$('#cmd_loginname').val(newvalue);
								break;
							case 'pass':
								$('#cmd_pass').val(newvalue);
								break;
						}

						var success = passwords.updateActive($('#cmd_id').val(), $('#cmd_loginname').val(), $('#cmd_website').val(), $('#cmd_address').val(), $('#cmd_pass').val(), $('#cmd_notes').val(), $('#cmd_category').val(), $('#cmd_deleted').val());
						if (success) {
							//var passwords = new Passwords(OC.generateUrl('/apps/passwords/passwords'));
							var view = new View(passwords);
							passwords.loadAll().done(function() {
								view.renderContent();
							})

							// building new table
							var source_passwords = $('#template-passwords-serialize').html();
							var template_passwords = Handlebars.compile(source_passwords);
							var html_passwords_serialize = template_passwords({
								passwords: passwords.getAll()
							});
							html_passwords_serialize = html_passwords_serialize.replace(/&quot;/g, '"');
							var rows = html_passwords_serialize.split('<br>');
							formatTable(false, rows);
						} else {
							OCdialogs.alert(t('passwords', 'Error: Could not update password.'), t('passwords', 'Save'), null, true);
						}
						$('#overlay').remove();
						$('#popup').remove();
					});
					return false;
				});

				$('#btn_share').click(function() {
					// share part
				});

				$('#app-settings-content').hide();

				// reset timer on hover (for touch screens)
				$('#idleTimer').mouseenter(function(event) {
					resetTimer(true);
				});
				$('#countSec').mouseenter(function(event) {
					resetTimer(true);
				});

				$('#back_to_passwords').click(function() {
					$('#section_table').show(300);
					$('#section_categories').hide(200);
				});

				$("#CategoriesTableContent").on("click", "td", function() {

					var $cell = $(this);
					var $row = $cell.closest('tr');
					var rows = $row.closest('table').find('tr').length;
					var cat_id = $row.find('.catTable_id').text();
					var cat_name = $row.find('.catTable_name').text();
					var is_trash = $cell.hasClass('icon-delete');

					if (is_trash) {
						OCdialogs.confirm(t('passwords', 'This will delete the category') + " '" + cat_name + "'. " + t('passwords', 'Are you sure?'), t('passwords', 'Category'), function(res) {
							if (res) {
								var categories = new Passwords(OC.generateUrl('/apps/passwords/categories'));
								categories.removeByID(cat_id).done(function() {
									// now removed from db, so delete from DOM
									$row.remove();
									if (rows == 1) {
										$('#emptycategories').show();
									}
								}).fail(function() {
									OCdialogs.alert(t('passwords', 'Error: Could not delete category.'), t('passwords', 'Category'), null, true);
								});
							}
						});
					}
				});

				$('#cat_add').click(function() {
					if ($('#cat_name').val().length == 0) {
						return false;
					}
					var categories = new Categories(OC.generateUrl('/apps/passwords/categories'));
					var cat_name = $('#cat_name').val();
					var cat_colour = $('#cat_colour').val();
					cat_colour = cat_colour.replace('#', '');
					var category = {
						categoryName: cat_name,
						categoryColour: cat_colour
					};
					var success = categories.create(category);

					if (success) {
						$('#cat_name').val('');
						$('#cat_colour').val('#eeeeee');
						$('#colorpicker').spectrum('set', 'eeeeee');
						setTimeout(function() {
							categories = new Categories(OC.generateUrl('/apps/passwords/categories'));
							categories.loadAll().done(function() {
								renderCategories(categories);
							}).fail(function() {
								OCdialogs.alert(t('passwords', 'Error: Could not load categories.'), t('passwords', 'Passwords'), null, true);
							});
						}, 500);
					} else {
						OCdialogs.alert(t('passwords', 'Error: Could not create category.'), t('passwords', 'Categories'), null, true);
					}
				});

				$('#sidebarClose').click(function() {
					$('#sidebarRow').val('');
					$('#app-content-wrapper').attr('class', '');
					$('#app-sidebar-wrapper').hide(100);
				});

				$('#delete_trashbin').click(function(event) {

					OCdialogs.confirm(t('passwords', 'This will permanently delete all passwords in this trash bin.') + ' ' + t('passwords', 'Are you sure?'), t('passwords', 'Trash bin'), 
						function(confirmed) {
							if (confirmed)	{

								$('#PasswordsTableContent tr').each(function() {
									var $row = $(this);
									var is_deleted = $row.hasClass('is_deleted');
									var id = $row.attr('attr_id');
									var passwords = new Passwords(OC.generateUrl('/apps/passwords/passwords'));
									if (is_deleted) {
										passwords.removeByID(id).done(function() {
											$row.remove();
											formatTable(true); // reset counters and show 'trash is empty'
										}).fail(function() {
										});
									}
								});

								setTimeout(function() {
									alert(t('passwords', 'Deletion of all trashed passwords done.'));
								}, 3000);
							}
					}, true);
				});

				$('#PasswordsTableContent td').click(function(event) {
					var $cell = $(this);
					var is_strength = $cell.hasClass('cell_strength');
					var is_date = $cell.hasClass('cell_datechanged');
					var is_notes = $cell.hasClass('icon-notes');
					var is_category = $cell.hasClass('cell_category');
					var is_info = $cell.hasClass('icon-info');
					var is_trash = $cell.hasClass('icon-delete');
					var is_restore = $cell.hasClass('icon-history');
					var active_table = $('#app-settings').attr("active-table");
					var $row = $cell.closest('tr');

					var passwords = new Passwords(OC.generateUrl('/apps/passwords/passwords'));

					// popUp function works with parameters: 
					// popUp(title, value, type, address_value, website, username);

					if (is_category) {
						popUp(t('passwords', 'Category'), $row.attr('attr_category'), 'category', '', $row.attr('attr_website'), $row.attr('attr_loginname'));
						$('#accept').click(function() {
							$row.attr('attr_category', $('#new_value_popup select').val());
							var success = passwords.updateActive($row.attr('attr_id'), $row.attr('attr_loginname'), $row.attr('attr_website'), $row.attr('attr_address'), $row.attr('attr_pass'), $row.attr('attr_notes'), $row.attr('attr_category'), $row.hasClass('is_deleted'));
							if (success) {
								var view = new View(passwords);
								passwords.loadAll().done(function() {
									view.renderContent();
								})
								// building new table
								var source_passwords = $('#template-passwords-serialize').html();
								var template_passwords = Handlebars.compile(source_passwords);
								var html_passwords_serialize = template_passwords({
									passwords: passwords.getAll()
								});
								html_passwords_serialize = html_passwords_serialize.replace(/&quot;/g, '"');
								var rows = html_passwords_serialize.split('<br>');
								formatTable(false, rows);
							} else {
								OCdialogs.alert(t('passwords', 'Error: Could not update password.'), t('passwords', 'Save'), null, true);
							}
							$('#overlay').remove();
							$('#popup').remove();
						});
						return false;
					}

					if (is_notes) {
						popUp(t('passwords', 'Notes'), $row.attr('attr_notes'), 'notes', '', $row.attr('attr_website'), $row.attr('attr_loginname'));
						$('#accept').click(function() {
							$row.attr('attr_notes', $('#new_value_popup').val());
							var success = passwords.updateActive($row.attr('attr_id'), $row.attr('attr_loginname'), $row.attr('attr_website'), $row.attr('attr_address'), $row.attr('attr_pass'), $row.attr('attr_notes'), $row.attr('attr_category'), $row.hasClass('is_deleted'));
							if (success) {
								if ($row.attr('attr_notes').length == 0) {
									$cell.removeClass('has-note');
								} else {
									$cell.addClass('has-note');
								}
							} else {
								OCdialogs.alert(t('passwords', 'Error: Could not update password.'), t('passwords', 'Save'), null, true);
							}
							$('#overlay').remove();
							$('#popup').remove();
						});
						return false;
					}

					if (is_info || is_strength || is_date) {
						if ($('#sidebarRow').val() == $row.attr('attr_id')) {
							$('#sidebarRow').val('');
							$('#app-content-wrapper').attr('class', '');
							$('#app-sidebar-wrapper').hide(100);
						} else {
							showSidebar($row);
						}
						return false;
					}

					if (is_trash) {
						if (active_table == 'active') {
							var success = passwords.updateActive($row.attr('attr_id'), $row.attr('attr_loginname'), $row.attr('attr_website'), $row.attr('attr_address'), $row.attr('attr_pass'), $row.attr('attr_notes'), $row.attr('attr_category'), "1");
							if (success) {
								$row.attr('class', 'is_deleted');
								$row.hide();
								formatTable(true);
								OCdialogs.info(t('passwords', 'The password was moved to the trash bin.'), t('passwords', 'Trash bin'), null, true);
							} else {
								OCdialogs.alert(t('passwords', 'Error: Could not update password.'), t('passwords', 'Trash bin'), null, true);
							}
							
						// from trash, remove from database
						} else {
							OCdialogs.confirm(t('passwords', 'This will delete the password for') + " '" + $row.attr('attr_website') + "' " + t('passwords', "with user name") + " '" + $row.attr('attr_loginname') + "'. " + t('passwords', 'Are you sure?'), t('passwords', 'Trash bin'), function(res) {
								if (res) {
									var view = new View(passwords);
									passwords.removeByID($row.attr('attr_id')).done(function() {
										// now removed from db, so delete from DOM
										$row.remove();
										formatTable(true);
									}).fail(function() {
										OCdialogs.alert(t('passwords', 'Error: Could not delete password.'), t('passwords', 'Trash bin'), null, true);
									});
								}
							});
						}
					}

					if (is_restore) {
						var success = passwords.updateActive($row.attr('attr_id'), $row.attr('attr_loginname'), $row.attr('attr_website'), $row.attr('attr_address'), $row.attr('attr_pass'), $row.attr('attr_notes'), $row.attr('attr_category'), "0");
						if (success) {
							$cell.removeClass('icon-history');
							$cell.addClass('icon-info');
							$row.removeClass('is_deleted');
							$row.hide();
							formatTable(true);
						} else {
							OCdialogs.alert(t('passwords', 'Error: Could not update password.'), t('passwords', 'Trash bin'), null, true);
						}
					}
				});					
			},
			renderNavigation: function() {

				// set settings
				var settings = new Settings(OC.generateUrl('/apps/passwords/settings'));
				settings.load();
				if ((settings.getKey('backup_allowed').toLowerCase() == 'true') == false) {
					// was already hidden with CSS at default for IE7 and lower
					// Now remove it from DOM (doesn't work on IE7 and lower)
					$('#app-settings-backup').remove();
				} else {
					// So show it
					$('#app-settings-backup').show();
				}
				$('#app-settings').attr('timer', settings.getKey('timer'));
				$('#app-settings').attr('days-orange', settings.getKey('days_orange'));
				$('#app-settings').attr('days-red', settings.getKey('days_red'));
				if ((settings.getKey('icons_allowed').toLowerCase() == 'true')) {
					$('#app-settings').attr('icons-show', settings.getKey('icons_show').toLowerCase() == 'true');
					$('#app-settings').attr('icons-service', settings.getKey('icons_service'));
				} else {
					$('#app-settings').attr('icons-show', 'false');
				}
				$('#app-settings').attr('hide-passwords', settings.getKey('hide_passwords').toLowerCase() == 'true');
				$('#app-settings').attr('hide-usernames', settings.getKey('hide_usernames').toLowerCase() == 'true');
				$('#app-settings').attr('hide-attributes', settings.getKey('hide_attributes').toLowerCase() == 'true');

				// set timer if set by user
				if ($('#app-settings').attr('timer') != '0') {
					resetTimer(false);
				}

				// edit categories
				$('#editCategories').click(function() {
					$('#app-settings-content').hide(200);
					$('#sidebarClose').click();
					$('#section_table').hide(200);
					$('#section_categories').show(400);
				});

				// move all to trash
				$('#trashAll').click(function() {
					trashAllPasswords(Passwords);
				});

				// download backup
				$('#backupDL').click(function() {
					backupPasswords();
				});

				// CSV import
				$('#upload_csv').on('change', function(event) {
					uploadCSV(event);
				});
				$('#importStart').click(function() {
					checkCSVsettings();
					importCSV();
				});
				$('#importCancel').click(function() {
					$('#CSVtableDIV').hide();
					$('#CSVcontent').text('');
					$('#CSVheadersBtn').removeClass('CSVbuttonOff');
					$('#CSVquotationmarksBtn').removeClass('CSVbuttonOff');
					$('#CSVescapeslashBtn').removeClass('CSVbuttonOff');
					$('#CSVsplit_rnBtn').removeClass('CSVbuttonOff');
				});
				$('#CSVheadersBtn').click(function() {
					$('#CSVheadersBtn').toggleClass('CSVbuttonOff');
					renderCSV(false);
				});
				$('#CSVquotationmarksBtn').click(function() {
					$('#CSVquotationmarksBtn').toggleClass('CSVbuttonOff');
					renderCSV(false);
				});
				$('#CSVescapeslashBtn').click(function() {
					$('#CSVescapeslashBtn').toggleClass('CSVbuttonOff');
					renderCSV(false);
				});
				$('#CSVsplit_rnBtn').click(function() {
					$('#CSVsplit_rnBtn').toggleClass('CSVbuttonOff');
					renderCSV(false);
				});
				$('#selectAll').click(function() {
					var checkboxes = $('#CSVtable td').find(':checkbox');
					checkboxes.prop('checked', true);
				});
				$('#selectNone').click(function() {
					var checkboxes = $('#CSVtable td').find(':checkbox');
					checkboxes.prop('checked', false);
				});
				

				// clear search field
				$('#search_clear').click(function() {
					$('#search_text').val('');
					$('#search_text').keyup();
				});

				// search function
				$('#search_text').keyup(function() {
					var $rows = $('#PasswordsTableContent tr').not('thead tr');
					var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

					// filter
					$rows.show().filter(function() {
						var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
						return !~text.indexOf(val);
					}).hide();
				});

				// click on other list item
				$('#list_active').click(function() {
					$('#list_active').addClass('active');
					$('#list_trash').removeClass('active');
					$('#app-settings').attr("active-table", 'active');
					$('#cleartrashbin').hide();
					$('#PasswordsTableContent tbody tr').show();
					$('#PasswordsTableContent tbody tr.is_deleted').hide();
					formatTable(true);
				});
				$('#list_trash').click(function() {
					$('#list_active').removeClass('active');
					$('#list_trash').addClass('active');
					$('#app-settings').attr("active-table", 'trashbin');

					$('#PasswordsTableContent tbody tr').hide();
					$('#PasswordsTableContent tbody tr.is_deleted').show();

					if ($(".menu_passwords_trashbin").text() > 0) {
						$('#cleartrashbin').show();
					}
					formatTable(true);
				});

				// clean up website: https://www.Google.com -> google.com
				$('#new_website').focusout(function() {
					if ((this.value.substring(0,7).toLowerCase() == 'http://' 
							|| this.value.substring(0,8).toLowerCase() == 'https://'
							|| this.value.substring(0,4).toLowerCase() == 'www.') 
						&& $('#new_address').val() == '') {
						$('#new_address').val(this.value.toLowerCase());
						$('#new_website').val(strip_website(this.value).toLowerCase());
					}
					
				});
				// try to set a domain entry on website field
				$('#new_address').focusout(function() {
					if ((this.value.substring(0,7).toLowerCase() == 'http://' 
							|| this.value.substring(0,8).toLowerCase() == 'https://'
							|| this.value.substring(0,4).toLowerCase() == 'www.') 
						&& $('#new_website').val() == '') {
						$('#new_website').val(URLtoDomain(this.value));
					}
				});

				// create a new password
				var self = this;
				$('#new_password_add').click(function() {

					if ($('#new_username').val() == '' 
						|| $('#new_website').val() == '' 
						|| $('#new_password').val() == '') 
					{
						OCdialogs.alert(t('passwords', 'Fill in the website, user name and password.'), t('passwords', 'Add password'), null, true);
						return false;
					}

					if ($('#new_address').val() != '' 
						&& $('#new_address').val().substring(0,7).toLowerCase() != 'http://' 
						&& $('#new_address').val().substring(0,8).toLowerCase() != 'https://'
						&& $('#new_address').val().substring(0,4).toLowerCase() != 'www.') 
					{
						if (isUrl($('#new_address').val())) {
							// valid URL, so add http
							$('#new_address').val('http://' + $('#new_address').val());
							// now check if valid
							if (!isUrl($('#new_address').val())) {
								OCdialogs.alert(t('passwords', 'Fill in a valid URL in the first field.') + ' ' + t('passwords', 'Note: This field is optional and can be left blank.'), t('passwords', 'Add password'), null, true);
								$('#new_address').select();
								return false;
							}
						} else {
							OCdialogs.alert(t('passwords', 'Fill in a valid URL in the first field.') + ' ' + t('passwords', 'Note: This field is optional and can be left blank.'), t('passwords', 'Add password'), null, true);
							$('#new_address').select();
							return false;
						}
					}

					var d = new Date();
					// date as YYYY-MM-DD
					var changedDate = d.getFullYear()
						+ '-' + ('0' + (d.getMonth() + 1)).slice(-2)
						+ '-' + ('0' + d.getDate()).slice(-2)

					var password = {
						'website': $('#new_website').val(),
						'pass': $('#new_password').val(),
						'properties': 
							'"loginname" : "' + $('#new_username').val()  + '", ' +
							'"address" : "' + $('#new_address').val() + '", ' +
							'"strength" : "' + strength_func($('#new_password').val()) + '", ' +
							'"length" : "' + $('#new_password').val().length + '", ' +
							'"lower" : "' + ~~strHasLower($('#new_password').val()) + '", ' +
							'"upper" : "' + ~~strHasUpper($('#new_password').val()) + '", ' +
							'"number" : "' + ~~strHasNumber($('#new_password').val()) + '", ' +
							'"special" : "' + ~~strHasSpecial($('#new_password').val()) + '", ' +
							'"category" : "' + $('#new_category select').val() + '", ' +
							'"datechanged" : "' + changedDate + '", ' +
							'"notes" : "' + $('#new_notes').val() + '"',
						'deleted': "0"
					};

					self._passwords.create(password).done(function() {

						$('#new_username').val('');
						$('#new_website').val('');
						$('#new_password').val('');
						$('#new_address').val('');
						$('#new_notes').val('');
						$('#generate_strength').text('');
						$('#generate_passwordtools').fadeOut(250);
						$('#gen_length').val('25');

						var passwords = new Passwords(OC.generateUrl('/apps/passwords/passwords'));
						var view = new View(passwords);
						passwords.loadAll().done(function() {
							view.renderContent();
						})

						// building new table
						var source_passwords = $('#template-passwords-serialize').html();
						var template_passwords = Handlebars.compile(source_passwords);
						var html_passwords_serialize = template_passwords({
							passwords: this._passwords.getAll()
						});
						html_passwords_serialize = html_passwords_serialize.replace(/&quot;/g, '"');
						var rows = html_passwords_serialize.split('<br>');
						formatTable(false, rows);

					}).fail(function() {
						OCdialogs.alert(t('passwords', 'Error: Could not create password.'), t('passwords', 'Add password'), null, true);
						return false;
					});

				});
				
				// ### change category
				// for select box in 'new password' part
				$('#new_category').change(function() {
					if ($('#new_category select').val() == '(change)') {
						$('#new_category select').val(0);
						$('#new_category select').attr('style', '');
						$('#editCategories').click();
					} else if ($('#new_category select').val() != 0) {
						var bg = $('#new_category').find(':selected').attr('bg');
						var fg = $('#new_category').find(':selected').attr('fg')
						$('#new_category select').attr('style', 'color: #' + fg + ' !important; background-color: ' + bg + ' !important; font-weight: bold !important;');
					} else {
						// 'none' chosen
						$('#new_category select').attr('style', '');
					}
				});
				// for select box above search bar
				$('#nav_category_list').change(function() {
					if ($('#nav_category_list select').val() == '(change)') {
						$('#nav_category_list select').val(0);
						$('#nav_category_list select').attr('style', '');
						if ($('#app-settings').attr("active-table") == 'active') {
							$('#list_active').click();
						} else {
							$('#list_trash').click();
						}
						$('#editCategories').click();
					} else if ($('#nav_category_list select').val() != 0) {
						var bg = $('#nav_category_list').find(':selected').attr('bg');
						var fg = $('#nav_category_list').find(':selected').attr('fg')
						$('#nav_category_list select').attr('style', 'color: #' + fg + ' !important; background-color: ' + bg + ' !important;');
						// filter
						var $rows = $('#PasswordsTableContent tr').not('thead tr');
						var val = $('#nav_category_list select option:selected').text();
						$rows.show().filter(function() {
							var text = $(this).find('.cell_category').text();
							return !~text.indexOf(val);
						}).hide();
					} else {
						// 'none' chosen
						$('#nav_category_list select').attr('style', '');
						if ($('#app-settings').attr("active-table") == 'active') {
							$('#list_active').click();
						} else {
							$('#list_trash').click();
						}
					}
				});

				// calculate strength
				$("#new_password").keyup(function() {
					strength_str(this.value, false);
				});

				// select whole password when entering field
				$('#new_password').click(function() {
					this.select();
				});

				// generate password
				$('#new_generate').click(function() {
					var popup_exist = ($('#gen_length_popup').val() > 0)

					if (!popup_exist) {
						// show options
						$('#generate_passwordtools').fadeIn(500);
						document.getElementById('generate_passwordtools').scrollIntoView();
					}

					var lower_checked = $('#gen_lower').prop('checked');
					var upper_checked = $('#gen_upper').prop('checked');
					var numbers_checked = $('#gen_numbers').prop('checked');
					var special_checked = $('#gen_special').prop('checked');
					var length_filled = $('#gen_length').val();
					var generate_new = '';

					if (!isNumeric(length_filled) || length_filled.length == 0 || length_filled < 4) {
						OCdialogs.alert(t('passwords', 'Fill in a valid number as length with a minimum of 4.'), t('passwords', 'Generate password'), null, true);
						return false;
					}
					if (!lower_checked && !upper_checked && !numbers_checked && !special_checked) {
						OCdialogs.alert(t('passwords', 'Select at least one option to generate a password.'), t('passwords', 'Generate password'), null, true);
						return false;
					}

					// run
					generate_new = generatepw(lower_checked, upper_checked, numbers_checked, special_checked, length_filled);
					
					// calculate strength
					strength_str(generate_new, false);

					// fill in
					if (popup_exist) {
						$('#new_value_popup').val(generate_new);
						$("#generate_strength").text('');
						$('#generate_passwordtools').hide();
					} else {
						$('#new_password').val(generate_new);
					}
				});

			},
			render: function() {
				$('#loading').show();
				$('#PasswordsTable').hide();
				this.renderNavigation();
				this.renderContent();
				$('#loading').hide();
				$('#PasswordsTable').show();
				$('#list_active').click();
			}
		};

		var settings = new Settings(OC.generateUrl('/apps/passwords/settings'));
		var passwords = new Passwords(OC.generateUrl('/apps/passwords/passwords'));
		var view = new View(passwords);
		var categories = new Categories(OC.generateUrl('/apps/passwords/categories'));
		
		settings.load();

		// disable context menu if set by admin
		if (settings.getKey('disable_contextmenu').toLowerCase() == 'true') {
			this.addEventListener('contextmenu', function(ev) {
				ev.preventDefault();
				OCdialogs.info(t('passwords', 'The context menu is disabled by your administrator.'), t('passwords', 'Context menu'), null, true);
				return false;
			}, false);
		}

		// reset timer on activity (mouse move)
		if (settings.getKey('timer') != 0) {
			this.addEventListener("mouseover", function() {
				if ($('#app-settings').attr('timer') != '0') {
					resetTimer(true);
				}
			});
		}

		categories.loadAll().done(function() {
			renderCategories(categories);
		}).fail(function() {
			OCdialogs.alert(t('passwords', 'Error: Could not load categories.'), t('passwords', 'Passwords'), null, true);
		});

		passwords.loadAll().done(function() {
			view.render();
		}).fail(function() {
			OCdialogs.alert(t('passwords', 'Error: Could not load passwords.'), t('passwords', 'Passwords'), null, true);
		});
	});


})(OC, window, jQuery);

function renderCategories(categories) {
	this._categories = categories;

	var source_categories = $('#template-categories').html();
	var template_categories = Handlebars.compile(source_categories);
	var html_categories = template_categories({
		categories: this._categories.getAll()
	});
	$('#CategoriesTableContent').html(html_categories);
	$('#new_category').html(''); // reset list in New Password part
	$('#nav_category_list').html(''); // reset list in navigation entry (below trash bin)

	// fill table
	var table = document.getElementById('CategoriesTableContent');

	if (table.rows.length == 0) {
		$('#emptycategories').show();
		$('#new_category').append('<p>(' + t('passwords', 'No categories') + ')</p>');
	} else {
		$('#emptycategories').hide();
		var cat_select = '<select>' // for new passwords
		cat_select += '<option value=0>(' + t('passwords', 'None') + ')</option>';
		for (var i = 0; i < table.rows.length; i++) {
			var catID = table.rows[i].cells[1].textContent;
			var catText = table.rows[i].cells[3].textContent;
			var catColorBG = table.rows[i].cells[4].textContent || 'fff';
			var catColorFG = getContrastYIQ(catColorBG)
			// this cannot be done with handlebars; foreground colour is missing
			table.rows[i].cells[0].innerHTML = '<div class="category" style="color:#' + catColorFG + ';background-color:#' + catColorBG + ';">' + catText + '</div';
			cat_select += '<option value=' + catID + ' bg=#' + catColorBG + ' fg=' + catColorFG + '>' + catText + '</option>';
		}
		cat_select += '<option value=(change)>(' + t('passwords', 'Edit categories') + ')</option>';
		cat_select += '</select>';
		$('#new_category').append(cat_select);
		$('#nav_category_list').html(cat_select);
	}
}
function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
function strHasLower(str) {
	return str.toUpperCase() != str;
}
function strHasUpper(str) {
	return str.toLowerCase() != str;
}
function strHasNumber(str) {
	var regex = /\d/g;
	return regex.test(str);
}
function strHasSpecial(str) {

	var number;

	for (var i = 0; i < str.length; i++) {
	
		number = 0;
		number = str.substring(i, i + 1).charCodeAt(0);

		switch(true) {
			case number === 33:
			case number >= 35 && number <= 36:
			case number === 38:
			case number >= 40 && number <= 41:
			case number === 43:
			case number >= 45 && number <= 47:
			case number >= 58 && number <= 60:
			case number >= 62 && number <= 64:
			case number === 95:
				return true;
				break;
		}

	}

	// no special chars
	return false;
	
}

function formatTable(update_only, rows) {

	var active_table = $('#app-settings').attr("active-table");
	var hide_usernames = $('#app-settings').attr("hide-usernames") == 'true';
	var hide_passwords = $('#app-settings').attr("hide-passwords") == 'true';
	var hide_attributes = $('#app-settings').attr("hide-attributes") == 'true';

	// btn_commands_newline 
	// will put the popup button with edit/copy/share buttons on a new line in the cell
	//
	// btn_commands_inline
	// will put the popup button with edit/copy/share buttons right next to the value in the cell

	if (!update_only) {

		// clear first
		$('#PasswordsTableContent tbody').html('');

		for (var i = 0; i < rows.length - 1; i++) {

			var activeRow = rows[i].trim();
			activeRow = activeRow.replace(/\n/g, '\\n');
		
			try {
				var row = JSON.parse('{' + activeRow + '}');
			} catch	(e) {
				alert(e + ' (row ' + i + '):\n{' + activeRow + '}');
			}
			
			if (row.deleted == 1) {
				var html_row = '<tr class="is_deleted" ';
			} else {
				var html_row = '<tr ';
			}
			if (row.datechanged == '0000-00-00') {
				row.datechanged = '1970-01-01'; // UNIX :)
			}
			html_row += 'attr_id="' + row.id + '" '
						+ 'attr_website="' + row.website + '" '
						+ 'attr_address="' + row.address + '" '
						+ 'attr_loginname="' + row.loginname + '" '
						+ 'attr_pass="' + row.pass + '" '
						+ 'attr_category="' + (row.category || '0') + '" '
						+ 'attr_notes="' + row.notes + '" '
						+ 'attr_datechanged="' + row.datechanged + '" '
						+ 'attr_strength="' + strength_int2str(row.strength) + '" '
						+ 'attr_length="' + row.length + '" '
						+ 'attr_lower="' + row.lower + '" '
						+ 'attr_upper="' + row.upper + '" '
						+ 'attr_number="' + row.number + '" '
						+ 'attr_special="' + row.special + '">'

			// start website
			if (isUrl(row.website) || row.address != '') {
				html_row += '<td type="website" sorttable_customkey=' + row.website + ' class="is_website cell_website">';
				var show_icons = ($('#app-settings').attr("icons-show") == 'true');

				// set real website url if available
				if (row.address != '') {
					if (row.address.substr(0, 7) == "http://" || row.address.substr(0, 8) == "https://") {
						var websiteURL = row.address;
					} else {
						var websiteURL = 'http://' + row.address;
					}
				} else {
					var websiteURL = 'http://' + row.website;
				}

				if (show_icons) {
					var icons_service = $('#app-settings').attr("icons-service");
					if (icons_service == 'ddg') { // DuckDuckGo
						html_row += '<a href="' + websiteURL + '" target="_blank"><img class="websitepic" src="https://icons.duckduckgo.com/ip2/' + row.website + '.ico">' + row.website + '</a>';
					}
					if (icons_service == 'ggl') { // Google
						html_row += '<a href="' + websiteURL + '" target="_blank"><img class="websitepic" src="https://www.google.com/s2/favicons?domain=' + row.website + '">' + row.website + '</a>';
					}
				} else {
					html_row += '<a href="' + websiteURL + '" target="_blank">' + row.website + '</a>';
				}
			} else { // no valid website url
				html_row += '<td type="website" sorttable_customkey=' + row.website + ' class="cell_website">' + row.website; // or else doesn't align very well
			}
			html_row += '<div class="btn_commands_inline">' +
						'<input class="btn_commands_open" type="button">' +
						'</div>' +
						'</td>';
			// end website

			// start loginname
			if (hide_usernames) {
				html_row += '<td type="loginname" sorttable_customkey=' + row.loginname + '>' +
							'******' + 
							'<div class="btn_commands_inline">' +
								'<input class="btn_commands_open" type="button">' +
							'</td>';
			} else {
				html_row += '<td type="loginname" sorttable_customkey=' + row.loginname + ' class="cell_username">' +
							row.loginname + 
							'<div class="btn_commands_inline">' +
								'<input class="btn_commands_open" type="button">' +
							'</td>';
			}
			// end loginname

			// start password
			if (hide_passwords) {
				html_row += '<td type="pass" sorttable_customkey=' + row.pass + '>' +
							'******' + 
							'<div class="btn_commands_inline">' +
								'<input class="btn_commands_open" type="button">' +
							'</td>';
			} else {
				html_row += '<td type="pass" sorttable_customkey=' + row.pass + ' class="cell_password">' +
							row.pass + 
							'<div class="btn_commands_inline">' +
								'<input class="btn_commands_open" type="button">' +
							'</td>';
			}

			if (!hide_attributes) {
				// start strength
				html_row += '<td sorttable_customkey=' + 1 / row.strength + ' class="' + strength_int2class(row.strength) + ' cell_strength">' + 
								strength_int2str(row.strength) +
							'<div class="btn_commands_inline">' +
								'(' + row.strength + ')' +
							'</td>';
				// end strength
				// start date
				var d = new Date(row.datechanged);
				html_row += '<td sorttable_customkey=' + date2sortkey(d) + ' class="' + date2class(d) + ' cell_datechanged"><span>' + 
								date2str(d, true) +
							'</span><div class="btn_commands_inline dateChanged">' +
								date2str(d, false) +
							'</td>';
				// end date
			}

			var cat_set = false;
			// category
			if (!row.category || row.category == 0) {
				html_row += '<td class="icon-category cell_category"></td>';
			} else {
				if ($('#CategoriesTableContent').html() == '') {
					// categories not yet populated, give second to load
					setTimeout(function() {
					}, 1000);
				}
				$('#CategoriesTableContent tr').each(function() {
					var cat_id = $(this).find('.catTable_id').text();
					if (cat_id == row.category) {
						var cat_bg = $(this).find('.catTable_bg').text();
						var cat_fg = getContrastYIQ(cat_bg);
						var cat_name = $(this).find('.catTable_name').text();
						html_row += '<td class="cell_category"><div class="category" style="color:#' + cat_fg + ';background-color:#' + cat_bg + ';">' + cat_name + '</div></td>';
						cat_set = true;
					}
				});
				if (!cat_set) {
					html_row += '<td class="icon-category cell_category"></td>';
				}
			}


			// notes
			if (row.notes) {
				html_row += '<td class="icon-notes has-note"></td>';
			} else {
				html_row += '<td class="icon-notes"></td>';
			}

			// info
			if (row.deleted == 1) {
				// replace the info-icon by a revert icon when a password is in trash
				html_row += '<td class="icon-history"></td>';
			} else {
				html_row += '<td class="icon-info"></td>';
			}

			// delete
			html_row += '<td class="icon-delete"></td>';
			
			html_row += '</tr>';

			$('#PasswordsTableContent tbody').append(html_row);

		}
	}

	var total = $('#PasswordsTableContent tbody tr').length;
	var deleted = $('#PasswordsTableContent tbody tr.is_deleted').length;

	// update counters
	$('#emptycontent').hide();
	$('#emptytrashbin').hide();
	$('#PasswordsTable').show();
	$('.menu_passwords_active').text(total - deleted);
	$('.menu_passwords_trashbin').text(deleted);
	if (active_table == 'active' && total - deleted == 0) {
		$('#emptycontent').show();
		$('#PasswordsTable').hide();
	}
	if (active_table == 'trashbin' && deleted == 0) {
		$('#delete_trashbin').hide();
		$('#emptytrashbin').show();
		$('#PasswordsTable').hide();
	}
}

function strength_func(Password) {

	var charInStr;
	var strength_calc;
	var passwordLength;
	var hasLowerCase;
	var hasUpperCase;
	var hasNumber;
	var hasSpecialChar1;
	var hasSpecialChar2;
	var hasSpecialChar3;
	var hasSpecialChar4;
	var charInt;

	passwordLength = Password.length;

	strength_calc = 0;

	// check length
	switch(true) {
		case passwordLength >= 8:
			//strength_calc = 1;
			break;
		case passwordLength <= 4:
			// password smaller than 5 chars is always bad
			return 0;
			break;
	}

	// loop ONCE through password
	for (var i = 1; i < passwordLength + 1; i++) {
		
		charInStr = Password.slice(i, i + 1);
		charInt = charInStr.charCodeAt(0);

		switch(true) {
			case charInt >= 97 && charInt <= 122:
				if (!hasLowerCase) {
					strength_calc = strength_calc + 1;
					hasLowerCase = true;
				}
				break;
			case charInt >= 65 && charInt <= 90:
				if (!hasUpperCase) {
					strength_calc = strength_calc + 1;
					hasUpperCase = true;
				}
				break;
			case charInt >= 48 && charInt <= 57:
				if (!hasNumber) {
					strength_calc = strength_calc + 1;
					hasNumber = true;
				}
				break;
			case charInt >= 33 && charInt <= 47:
				if (!hasSpecialChar1) {
					strength_calc = strength_calc + 1;
					hasSpecialChar1 = true;
				}
				break;
			case charInt >= 58 && charInt <= 64:
				if (!hasSpecialChar2) {
					strength_calc = strength_calc + 1;
					hasSpecialChar2 = true;
				}
				break;
			case charInt >= 91 && charInt <= 96:
				if (!hasSpecialChar3) {
					strength_calc = strength_calc + 1;
					hasSpecialChar3 = true;
				}
				break;
			case charInt >= 123 && charInt <= 255:
				if (!hasSpecialChar4) {
					strength_calc = strength_calc + 1;
					hasSpecialChar4 = true;
				}
				break;
		}

	}
	
	strength_calc = strength_calc + (Math.floor(passwordLength / 8) * ((hasLowerCase ? 1 : 0) + (hasUpperCase ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecialChar1 ? 1 : 0) + (hasSpecialChar2 ? 1 : 0) + (hasSpecialChar3 ? 1 : 0) + (hasSpecialChar4 ? 1 : 0)));
	
	var power = 6;
	strength_calc = strength_calc + Math.round(Math.pow(passwordLength, power) / Math.pow(10, power + 1));

	return strength_calc;

}

function generatepw(lower, upper, number, special, length_chars) {

	var length_calc = Math.floor(length_chars / (lower + upper + number + special));

	var Wlower = "";
	var Wupper = "";
	var Wnumber = "";
	var Wspecial = "";

	if (lower) {
		Wlower = random_characters(0, length_calc);
	}
	if (upper) {
		Wupper = random_characters(1, length_calc);
	}
	if (number) {
		Wnumber = random_characters(2, length_calc);
	}
	if (special) {
		Wspecial = random_characters(3, length_calc);
	}

	var ww = "" + Wlower + Wupper + Wnumber + Wspecial;

	// e.g. length 27 with all 4 options = 6 char for every option (24) so 3 remaining
	// so fill up, starting with special, then number, then upper, then lower:
	var difference = length_chars - length_calc * (lower + upper + number + special);
	if (special) {
		ww = ww + random_characters(3, difference);
	} else if (number) {
		ww = ww + random_characters(2, difference);
	} else if (upper) {
		ww = ww + random_characters(1, difference);
	} else if (lower) {
		ww = ww + random_characters(0, difference);
	}

	// do a Fisher-Yates shuffle
	var a = ww.split("");
	var n = a.length;

	for (var i = n - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var tmp = a[i];
		a[i] = a[j];
		a[j] = tmp;
	}

	ww = a.join("");

	return ww;

}

function random_characters(char_kind, size_wanted) {

	var allowed = "";
	var text = "";

	switch (char_kind) {
		// No | l I 1 B 8 0 O o due to reading ability
		case 0:
			allowed = "abcdefghijkmnpqrstuvwxyz";
			break;
		case 1:
			allowed = "ACDEFGHJKLMNPQRSTUVWXYZ";
			break;
		case 2:
			allowed = "2345679";
			break;
		case 3:
			allowed = "!@#$%^&*()_+~[]{}:;?><,./-=";
			break;
	}

	for (var i = 0; i < size_wanted; i++)
	text += allowed.charAt(Math.floor(Math.random() * allowed.length));

	return text;
}

function strength_int2str(integer) {

	switch (true) {
		case (integer < 8):
			return t('passwords', 'Weak');
			break;
		case (integer < 15):
			return t('passwords', 'Moderate');
			break;
		default: // everything >= 15
			return t('passwords', 'Strong');
	}
}
function strength_int2class(integer) {

	switch (true) {
		case (integer < 8):
			return 'red';
			break;
		case (integer < 15):
			return 'orange';
			break;
		default: // everything >= 15
			return 'green';
	}
}
function strength_str2class(str) {

	switch (str) {
		case t('passwords', 'Weak'):
			return 'red';
			break;
		case t('passwords', 'Moderate'):
			return 'orange';
			break;
		case t('passwords', 'Strong'):
			return 'green';
	}
}
function bool2class_str(bool) {

	switch (parseInt(bool)) {
		case 0:
			return ["red", t('passwords', 'No')];
			break;
		case 1:
			return ["green", t('passwords', 'Yes')];
	}
}
function date2sortkey(dateChanged) {
	return (dateChanged.getFullYear()
		+ ('0' + (dateChanged.getMonth() + 1)).slice(-2)
		+ ('0' + dateChanged.getDate()).slice(-2)) / 10000000;
}
function date2class(dateChanged) {

	var dateToday = new Date();
	var diffInDays = Math.floor((dateToday - dateChanged) / (1000 * 60 * 60 * 24));

	var days_orange = $('#app-settings').attr("days-orange");
	var days_red = $('#app-settings').attr("days-red");

	if (diffInDays > days_red - 1) {
		return 'red'; // default: > 365 days
	} else if (diffInDays > days_orange - 1) {
		return 'orange'; // default: 150-364 days
	} else if (diffInDays < days_orange) {
		return 'green'; // < default: 150 days
	}
}
function date2str(dateChanged, timeAgo) {

	var language = $('html').attr('lang');

	if (!timeAgo) {
		var month = dateChanged.getMonth() + 1;
		var date_str;
		var month_str;
		switch (month) {
			case 1:
				month_str = t('passwords', 'January');
				break;
			case 2:
				month_str = t('passwords', 'February');
				break;
			case 3:
				month_str = t('passwords', 'March');
				break;
			case 4:
				month_str = t('passwords', 'April');
				break;
			case 5:
				month_str = t('passwords', 'May');
				break;
			case 6:
				month_str = t('passwords', 'June');
				break;
			case 7:
				month_str = t('passwords', 'July');
				break;
			case 8:
				month_str = t('passwords', 'August');
				break;
			case 9:
				month_str = t('passwords', 'September');
				break;
			case 10:
				month_str = t('passwords', 'October');
				break;
			case 11:
				month_str = t('passwords', 'November');
				break;
			case 12:
				month_str = t('passwords', 'December');
				break;
		}

		if (language == 'en') {
			// format: 14th March 2011, most Brittish according to https://www.englishclub.com/vocabulary/time-date.htm
			var suffix;
			switch (dateChanged.getDate()) {
				case 1:
				case 21:
				case 31:
					suffix = 'st';
					break;
				case 2:
				case 22:
					suffix = 'nd';
					break;
				case 3:
				case 23:
					suffix = 'rd';
					break;
				default:
					suffix = 'th';
					break;
			}
			date_str = dateChanged.getDate() + '<sup>' + suffix + '</sup> ' + month_str + ' ' + dateChanged.getFullYear();
		} else if (language == 'nl') {
			// Dutch: 14 maart 2015
			date_str = dateChanged.getDate() + ' ' + month_str + ' ' + dateChanged.getFullYear();
		} else if (language == 'de') {
			// German: 14. März 2015
			date_str = dateChanged.getDate() + '. ' + month_str + ' ' + dateChanged.getFullYear();
		} else if (language == 'es') {
			// Spanish: 14 de marzo de 2015
			date_str = dateChanged.getDate() + ' de ' + month_str + ' de ' + dateChanged.getFullYear();
		} else if (language == 'ca') {
			// Catalan: 14 de març de 2015
			if ((month_str[0] == 'a') || (month_str[0] == 'o')) {
				date_str = dateChanged.getDate() + ' d\'' + month_str + ' de ' + dateChanged.getFullYear();
			} else {
				date_str = dateChanged.getDate() + ' de ' + month_str + ' de ' + dateChanged.getFullYear();
			}

		} else {
			// all others: March 14, 2015
			date_str = month_str + ' ' + dateChanged.getDate() + ', ' + dateChanged.getFullYear();
		}

		return date_str;

	}

	var dateToday = new Date();
	var diffInDays = Math.floor((dateToday - dateChanged) / (1000 * 60 * 60 * 24));
	switch (diffInDays) {
		case 0:
			return t('passwords', 'today');
			break;
		case 1:
			if (language == 'es') {
				return 'hace ' + diffInDays + ' ' + t('passwords', 'day ago');
			} else if (language == 'ca') {
				return 'fa ' + diffInDays + ' ' + t('passwords', 'day ago');
			} else {
				return diffInDays + ' ' + t('passwords', 'day ago');
			}
			break;
		default:
			if (language == 'es') {
				return 'hace ' + diffInDays + ' ' + t('passwords', 'days ago');
			} else if (language == 'ca') {
				return 'fa ' + diffInDays + ' ' + t('passwords', 'days ago');
			} else {
				return diffInDays + ' ' + t('passwords', 'days ago');
			}
	}
}


function strength_str(passw, return_string_only) {

	if (!return_string_only) {
		if (passw == '') { 
			$("#generate_strength").text(''); 
			return false;
		}

		$("#generate_strength").removeClass("red");
		$("#generate_strength").removeClass("orange");
		$("#generate_strength").removeClass("green");
	}
	
	switch (strength_func(passw)) {
		case 0:
		case 1:
		case 2:
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
			if (return_string_only) { return t('passwords', 'Weak'); }
			$("#generate_strength").text(t('passwords', 'Strength') + ': ' + t('passwords', 'Weak').toLowerCase() + ' (' + strength_func(passw) + ')');
			$("#generate_strength").addClass("red");
			break;
		case 8:
		case 9:
		case 10:
		case 11:
		case 12:
		case 13:
		case 14:
			if (return_string_only) { return t('passwords', 'Moderate'); }
			$("#generate_strength").text(t('passwords', 'Strength') + ': ' + t('passwords', 'Moderate').toLowerCase() + ' (' + strength_func(passw) + ')');
			$("#generate_strength").addClass("orange");
			break;
		default: // everything >= 15
			if (return_string_only) { return t('passwords', 'Strong'); }
			$("#generate_strength").text(t('passwords', 'Strength') + ': ' + t('passwords', 'Strong').toLowerCase() + ' (' + strength_func(passw) + ')');
			$("#generate_strength").addClass("green");
	}

	$("#generate_strength_popup").text($("#generate_strength").text());
	$("#generate_strength_popup").attr("class", $("#generate_strength").attr("class"));

}
function escapeHTML(text) {
	if (typeof text !== 'undefined') {
		return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	} else {
		return text;
	}
}
function isUrl(url) {

	// not starting with a whitespace char or / or $ or . or ? or #
	// overall no spaces allowed
	// at least 1 char before and 2 chars after a dot
	// test for ^[^\s/$.?#]\S{1,}\.[a-z]{2,}$
	url = url.toLowerCase();
	var strRegex = '^[^\\s/$.?#]\\S{1,}\\.[a-z]{2,}$';

	var re = new RegExp(strRegex);

	return re.test(url);
}
function strip_website(website) {

	var convert = website;

	if (!isUrl(website)) {
		return website;
	}
	
	if (convert.substr(0, 8) == "https://") {
		convert = convert.substr(8, convert.length - 8);
	};

	if (convert.substr(0, 7) == "http://") {
		convert = convert.substr(7, convert.length - 7);
	};
	
	if (convert.substr(0, 4) == "www.") {
		convert = convert.substr(4, convert.length - 4);
	};

	return convert;
}
function URLtoDomain(website) {

	var domain;
	// remove protocol (http, ftp, etc.) and get domain
	if (website.indexOf("://") > -1) {
		domain = website.split('/')[2];
	}
	else {
		domain = website.split('/')[0];
	}

	// remove port number
	domain = domain.split(':')[0];

	// remove unwanted wwww. for sorting purposes
	if (domain.substr(0, 4) == "www.") {
		domain = domain.substr(4, domain.length - 4);
	};

	return domain;
}
function markRow(row) {
	var rows = $('tr', $('#PasswordsTableContent'));
	rows.eq(row).animate( { backgroundColor: '#ffa' }, 400, function() {
		$(this).animate( { backgroundColor: 'none' }, 3000);
	});
}

function backupPasswords() {

	// No support in IE
	if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
		OCdialogs.alert(t('passwords', 'This function is unsupported on your browser. Use a modern browser instead.'), t('passwords', 'Download Backup'), null, true);
		return false;
	}

	OCdialogs.confirm(t('passwords', 'This will download an unencrypted backup file, which contains all your passwords.') + ' ' + t('passwords', 'This file is fully compatible with other password services, such as KeePass, 1Password and LastPass.') + ' ' + t('passwords', 'Are you sure?'), t('passwords', 'Download Backup'), 
		function(confirmed) {
			if (confirmed)	{
				var d = new Date();
				var textToWrite = '"Website","Username","Passwords","FullAddress","Notes"\r\n';
				var rowValue;

				var table = document.getElementById('PasswordsTableContent');
				for (var i = 1; i < table.rows.length; i++) {
					for (var j = 0; j < table.rows[i].cells.length; j++)


						if (j == 0 || j == 1 || j == 2 || j == 12 || j == 13) { // columns: website, username, pass, address, notes
							rowValue = table.rows[i].cells[j].textContent;
							// escape " and \ by putting a \ before them
							rowValue = rowValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
							textToWrite += '"' + rowValue + '",';
						}

						textToWrite = textToWrite.substring(0, textToWrite.length - 1) + '\r\n';

				}

				var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'}); 
				var d = new Date();

				// filename as YYYYMMDD_backup.txt
				var fileNameToSaveAs = d.getFullYear()
									 + ('0' + (d.getMonth() + 1)).slice(-2)
									 + ('0' + d.getDate()).slice(-2)
									 + '_backup.csv';

				var downloadLink = document.createElement("a");
				downloadLink.download = fileNameToSaveAs; 
				downloadLink.innerHTML = "Download File";
				
				if (window.webkitURL != null) {
					// Chrome allows the link to be clicked
					// without actually adding it to the DOM.
					downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
				} else {
					// Firefox requires the link to be added to the DOM
					// before it can be clicked.
					downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
					downloadLink.onclick = destroyClickedElement;
					downloadLink.style.display = "none";
					document.body.appendChild(downloadLink);
				}

				downloadLink.click();
				downloadLink = '';

				// collapse settings part in navigation pane
				$('#app-settings-content').hide();
			}
		}, true);

}
function destroyClickedElement(event) {
	document.body.removeChild(event.target);
}
function uploadCSV(event) {

	if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
		OCdialogs.alert(t('passwords', 'This function is unsupported on your browser. Use a modern browser instead.'), t('passwords', 'Import CSV File'), null, true);
		return false;
	}

	//Retrieve the first (and only!) File from the FileList object
	var f = event.target.files[0]; 

	if (!f) {
		OCdialogs.alert('No file loaded', t('passwords', 'Import CSV File'), null, true);
		$('#upload_csv').replaceWith($('#upload_csv').clone(true).val(''));
		return false;
	} else if (f.name.substr(f.name.length - 4, 4).toLowerCase() != '.csv') {
		// validate file
		OCdialogs.alert(t('passwords', 'This is not a valid CSV file.') + ' ' + ('passwords', 'Only files with CSV as file extension are allowed.'), t('passwords', 'Import CSV File'), null, true);
		$('#upload_csv').replaceWith($('#upload_csv').clone(true).val(''));
		return false;
	} else {

		var r = new FileReader();
		
		r.onload = function(event) {
			var fileContent = event.target.result;
			$('#CSVcontent').text(fileContent);
			renderCSV(true);
		}
		r.readAsText(f); // = execute
	}

	$('#CSVtableDIV h2').text(t('passwords', 'Import CSV File') + ": '" + f.name + "' (~" + Math.round(f.size / 1024) + ' kB)');
	$('#CSVpreviewTitle').text(t('passwords', 'Preview') + ":");

	// reset upload file field
	$('#upload_csv').replaceWith($('#upload_csv').clone(true).val(''));

}
function renderCSV(firstTime) {

	// clear first
	$('#CSVtable').empty();
	$('#CSVerrorfield').empty();

	var contents = $('#CSVcontent').text();
	contents = contents.replace(/"\n/g,"\"\"\n").replace(/"\r\n/g,"\"\"\r\n");

	if ($('#CSVsplit_rnBtn').hasClass('CSVbuttonOff')) {
		var count = (contents.match(/\n/g) || []).length + 1;
		var lines = contents.split('"\n');
	} else {
		var count = (contents.match(/\r\n/g) || []).length + 1;
		var lines = contents.split('"\r\n');
	}
	if ($('#CSVheadersBtn').hasClass('CSVbuttonOff')) {
		var startRow = 0;
	} else {
		var startRow = 1;
	}
	if ($('#CSVquotationmarksBtn').hasClass('CSVbuttonOff')) {
		var quotationMarks = false;
		var splitDelimiter = ',';
	} else {
		var quotationMarks = true;
		var splitDelimiter = '","';
	}
	if ($('#CSVescapeslashBtn').hasClass('CSVbuttonOff')) {
		var escapeSlash = false;
	} else {
		var escapeSlash = true;
	}

	if (count < 1) {
		InvalidCSV(t('passwords', 'This file contains no passwords.'));
	}

	var countColumns = 0;

	for (var i = startRow; i < lines.length; i++) {
		// i = 1 with headers, so skip i = 0 (headers tested before)

		// loop once to check if all lines contain at least 3 values
		
		if (lines[i] != '') {
			if (!quotationMarks && lines[i].substr(0, 1) != '"') {
				InvalidCSV(t('passwords', 'This file contains one or more values without quotation marks.'));
			}

			var line = lines[i].split(splitDelimiter);

			if (countColumns < line.length) {
				countColumns = line.length;
			}
			if (line.length < 3) {
				InvalidCSV(t('passwords', 'This file contains one or more lines with less than 3 columns.'));
			}
			if (quotationMarks) {
				// line is "value1","value2","value3"
				// and thus cut first and last '"'
				lines[i] = lines[i].substr(1, lines[i].trim().length - 2);
			}
		} else {
			count = count - 1;
		}
	}

	// create tableheads
	var CSVtable = $('#CSVtable');
	var tableHead = ''

	tableHead = '<thead><tr><td id="CSVcolumnCheck">' + t('passwords', 'Import') + ':</td>'
	for (i = 1; i < countColumns + 1; i++) {
		tableHead = tableHead +
			'<td id="CSVcolumnTD' + i + '">' +
				'<select id="CSVcolumn' + i + '">' +
					'<option value="website">' + t('passwords', 'Website or company') + '</option>' +
					'<option value="username">' + t('passwords', 'Login name') + '</option>' +
					'<option value="password">' + t('passwords', 'Password') + '</option>' +
					'<option value="url">' + t('passwords', 'Full URL') + '</option>' +
					'<option value="notes">' + t('passwords', 'Notes') + '</option>' +
					'<option value="empty" selected>(' + t('passwords', 'Do not import') + ')</option>' +
				'</select>' +
			'</td>';

	}
	tableHead = tableHead + '</tr></thead>';
	if (countColumns != 0) {
		CSVtable.append(tableHead);
	}

	$('#CSVcolumn1 option').eq(0).prop('selected', true);
	$('#CSVcolumn2 option').eq(1).prop('selected', true);
	$('#CSVcolumn3 option').eq(2).prop('selected', true);
	$('#CSVcolumn4 option').eq(3).prop('selected', true);
	$('#CSVcolumn5 option').eq(4).prop('selected', true);
	

	var tableBody = '<tbody>';
	for (i = startRow; i < lines.length; i++) {
		if (lines[i] != '') {
			var line = lines[i].split(splitDelimiter);
			
			tableBody = tableBody + '<tr><td><input type="checkbox" id="CSVcheckRow' + i + '" checked></td>';	

			for (var j = 0; j < countColumns; j++) {
				if (typeof line[j] !== 'undefined') {
					if (escapeSlash) {
						tableBody = tableBody + '<td><textarea disabled>' + escapeHTML(line[j]).replace(/\\"/g, '"').replace(/\\\\/g, '\\') + '</textarea></td>';
					 } else {
						tableBody = tableBody + '<td><textarea disabled>' + escapeHTML(line[j]) + '</textarea></td>';
					}
				}
			}
			tableBody = tableBody + '</tr>';
		}
	}
	tableBody = tableBody + '</tbody>';
	CSVtable.append(tableBody);

	if (firstTime) {
		// align to horizontal center
		$('#CSVtableDIV').show();
		var CSVtableDIVWidth = document.getElementById('CSVtableDIV').clientWidth;
		var browserWidth = Math.max(
			document.body.scrollWidth, document.documentElement.scrollWidth,
			document.body.offsetWidth, document.documentElement.offsetWidth,
			document.body.clientWidth, document.documentElement.clientWidth
		);
		// align to vertical center
		var CSVtableDIVHeight = document.getElementById('CSVtableDIV').clientHeight;
		var browserHeight = Math.max(
			document.body.scrollHeight, document.documentElement.scrollHeight,
			document.body.offsetHeight, document.documentElement.offsetHeight,
			document.body.clientHeight, document.documentElement.clientHeight
		);
		$('#CSVtableScroll').css('maxHeight', browserHeight * 0.45);
		document.getElementById("CSVtableDIV").style.left = (browserWidth - CSVtableDIVWidth) / 2 + "px";
		document.getElementById("CSVtableDIV").style.top = (browserHeight - CSVtableDIVHeight) / 3 + "px";	
		$('#CSVtableDIV').hide();
		$('#app-settings-content').hide();
		$('#CSVtableDIV').show(400);
	}

	// set title of preview + password count
	if ((count - startRow) == 1) {
		$('#CSVpreviewTitle').text(t('passwords', 'Preview') + ' (' + (count - startRow) + ' ' + t('passwords', 'Password').toLowerCase() + '):');
	} else {
		$('#CSVpreviewTitle').text(t('passwords', 'Preview') + ' (' + (count - startRow) + ' ' + t('passwords', 'Passwords').toLowerCase() + '):');
	}

	$('#CSVcolumnCount').val(countColumns);

	checkCSVsettings();

}
function checkCSVsettings() {

	var countColumns = $('#CSVcolumnCount').val();

	var selectedOptions = '';
	var multipleColumnError = false;
	var hasWebsite = false;
	var hasUsername = false;
	var hasPassword = false;

	for (var i = 0; i < countColumns; i++) {
		$('#CSVcolumnTD' + i).removeClass('CSVcolumnInvalid');
		selectedOptions = selectedOptions + $('#CSVcolumn' + i).val();
		if ($('#CSVcolumn' + i).val() == 'website') {
			hasWebsite = true;
		}
		if ($('#CSVcolumn' + i).val() == 'username') {
			hasUsername = true;
		}
		if ($('#CSVcolumn' + i).val() == 'password') {
			hasPassword = true;
		}
	}

	// check website on multiple occurences
	if ((selectedOptions.match(/website/g) || []).length > 1) {
		for (var i = 0; i <= countColumns; i++) {
			if ($('#CSVcolumn' + i).val() == 'website') {
				$('#CSVcolumnTD' + i).addClass('CSVcolumnInvalid');
				multipleColumnError = true;
			}
		}
	}
	// check username on multiple occurences
	if ((selectedOptions.match(/username/g) || []).length > 1) {
		for (i = 0; i < countColumns; i++) {
			if ($('#CSVcolumn' + i).val() == 'username') {
				$('#CSVcolumnTD' + i).addClass('CSVcolumnInvalid');
				multipleColumnError = true;
			}
		}
	}
	// check password on multiple occurences
	if ((selectedOptions.match(/password/g) || []).length > 1) {
		for (i = 0; i < countColumns; i++) {
			if ($('#CSVcolumn' + i).val() == 'password') {
				$('#CSVcolumnTD' + i).addClass('CSVcolumnInvalid');
				multipleColumnError = true;
			}
		}
	}
	// check url on multiple occurences
	if ((selectedOptions.match(/url/g) || []).length > 1) {
		for (i = 0; i < countColumns; i++) {
			if ($('#CSVcolumn' + i).val() == 'url') {
				$('#CSVcolumnTD' + i).addClass('CSVcolumnInvalid');
				multipleColumnError = true;
			}
		}
	}
	// check notes on multiple occurences
	if ((selectedOptions.match(/notes/g) || []).length > 1) {
		for (i = 0; i < countColumns; i++) {
			if ($('#CSVcolumn' + i).val() == 'notes') {
				$('#CSVcolumnTD' + i).addClass('CSVcolumnInvalid');
				multipleColumnError = true;
			}
		}
	}

	// check if no red text appeared, else disable import button
	if ($('#CSVerrorfield').text() != '') {
		$('#importStart').css ('opacity', 0.5);
		$('#importStart')[0].disabled = true;
		throw new Error('Invalid values. Check red text.');
	} else {
		$('#importStart').css ('opacity', 1);
		$('#importStart')[0].disabled = false;
	}
	if (multipleColumnError) {
		throw new Error('Invalid values. Check red text.');
	}

}
function importCSV() {

	var countColumns = $('#CSVcolumnCount').val();
	var websiteColumn = -1;
	var loginColumn = -1;
	var passwordColumn = -1;
	var urlColumn = -1;
	var notesColumn = -1;

	for (var i = 1; i <= countColumns; i++) {
		if ($('#CSVcolumn' + i).val() == 'website') {
			websiteColumn = i;
		}
		if ($('#CSVcolumn' + i).val() == 'username') {
			loginColumn = i;
		}
		if ($('#CSVcolumn' + i).val() == 'password') {
			passwordColumn = i;
		}
		if ($('#CSVcolumn' + i).val() == 'url') {
			urlColumn = i;
		}
		if ($('#CSVcolumn' + i).val() == 'notes') {
			notesColumn = i;
		}
	}

	if (websiteColumn == -1 || loginColumn == -1 || passwordColumn == -1) {
		OCdialogs.alert(t('passwords', 'Fill in the website, user name and password.'), t('passwords', 'Import CSV File'), null, true);
		throw new Error('Select a column for website, username and password.');
	}

	var CSVtable = document.getElementById('CSVtable');
	var loginCSV = '';
	var websiteCSV = '';
	var urlCSV = '';
	var passwordCSV = '';
	var notesCSV = '';
	var passarray = [];

	for (var r = 1; r < CSVtable.rows.length; r++) {
		if ($('#CSVcheckRow' + r).is(":checked")) {
			for (var c = 0; c <= countColumns; c++) {
				if (c == websiteColumn) {
					websiteCSV = CSVtable.rows[r].cells[c].textContent;
				}
				if (c == loginColumn) {
					loginCSV = CSVtable.rows[r].cells[c].textContent;
				}
				if (c == passwordColumn) {
					passwordCSV = CSVtable.rows[r].cells[c].textContent;
				}
				if (c == urlColumn) {
					urlCSV = CSVtable.rows[r].cells[c].textContent;
				}
				if (c == notesColumn) {
					notesCSV = CSVtable.rows[r].cells[c].textContent;
				}
			}

			urlCSV = urlCSV.toLowerCase();

			// validate URL, must have protocol like http(s)						
			if (urlCSV != '' 
				&& urlCSV.substring(0, 7).toLowerCase() != 'http://' 
				&& urlCSV.substring(0, 8).toLowerCase() != 'https://') 
			{
				if (isUrl(urlCSV)) {
					// valid ULR, so add http
					urlCSV = 'http://' + urlCSV;
					// now check if valid
					if (!isUrl(urlCSV)) {
						OCdialogs.alert(t('passwords', 'This is not a valid URL, so this value will not be saved:') + ' ' + urlCSV, t('passwords', 'Import CSV File'), null, true);
						urlCSV = '';
					}
				} else {
					OCdialogs.alert(t('passwords', 'This is not a valid URL, so this value will not be saved:') + ' ' + urlCSV, t('passwords', 'Import CSV File'), null, true);
					urlCSV = '';
				}
			}

			passarray.push({
				website : websiteCSV,
				loginname : loginCSV,
				address : urlCSV,
				pass : passwordCSV,
				notes : notesCSV,
				deleted : "0"
			});
		}
	}
	$('#CSVtableDIV').hide();
	$('#CSVprogressDIV').show();
	$('#CSVprogressActive').val(0);
	$('#CSVprogressTotal').val(passarray.length);
	importPassword(passarray);
}

function importPassword(array) {
	var password = array[0];
	if (array.length > 0) {
		array.shift();
		$('#CSVprogressActive').val($('#CSVprogressTotal').val() - array.length);
		var done = ($('#CSVprogressActive').val() / $('#CSVprogressTotal').val()) * 100;
		$('#CSVprogressDone').css('width', done + '%');
		$('#CSVprogressText1').text(password.website + ' (' + password.loginname + ')');
		$('#CSVprogressText2').text($('#CSVprogressActive').val() + ' / ' + $('#CSVprogressTotal').val() + ' (' + Math.round(done) + '%)');
		var success = $.ajax({
			url: OC.generateUrl('/apps/passwords/passwords'),
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(password),
			success: function(data) {
				if (array.length == 0) {
					setTimeout(function() {
						alert(t('passwords', 'Import of passwords done. This page will now reload.'));
						location.reload(true);
					}, 500);
				}
				importPassword(array);
			},
			error: function(data) {
				setTimeout(function() {
					alert(t('passwords', 'The session has expired. This page will now reload.'));
					location.reload(true);
				}, 500);
			}
		});
	}
}

function InvalidCSV(error_description) {
	if ($('#CSVerrorfield').text().indexOf(error_description) == -1) {
		$('#CSVerrorfield').append('<p>' + error_description + '</p>')
	}
}

function popUp(title, value, type, address_value, website, username) {
	$('#popup').html('');
	$('#overlay').remove();
	$('#popup').remove();
	$('<div/>', {id: 'overlay'}).appendTo($('#app'));
	$('<div/>', {id: 'popup'}).appendTo($('#app'));
	$('<div/>', {id: 'popupTitle'}).appendTo($('#popup'));
	$('<span/>', {text:website}).appendTo($('#popupTitle'));
	$('<br/>').appendTo($('#popupTitle'));
	$('<span/>', {text:t('passwords', 'Login name') + ': ' + username, id:"popupSubTitle"}).appendTo($('#popupTitle'));

	$('<div/>', {id: 'popupContent'}).appendTo($('#popup'));
	$('<p/>', {text:t('passwords', 'Enter a new value and press Save to keep the new value.\nThis cannot be undone.')}).appendTo($('#popupContent'));
	$('<br/>').appendTo($('#popupContent'));
	$('<p/>', {text:title + ':'}).appendTo($('#popupContent'));
	if (type == 'notes') {
		$('<textarea/>', {id:"new_value_popup", rows:"5"}).val(value).appendTo($('#popupContent'));
	} else if (type == 'category') {
		$('#popupContent').append('<div id="new_value_popup">' + $('#new_category').html() + '</div>');
		$('#new_value_popup select option').last().remove(); // no Edit categories
		$('#new_value_popup select').val(value);
	} else {
		$('<input/>', {type:'text', id:"new_value_popup", autocorrect:'off', autocapitalize:'off', spellcheck:'false'}).val(value).appendTo($('#popupContent'));
		if (type == 'password') {
			$('<p id="generate_strength_popup"></p>').appendTo($('#popupContent'));
			
			$('<input>', {type:'checkbox', id:"gen_lower_popup"}).prop("checked", $('#gen_lower').is(":checked")).appendTo($('#popupContent'));
			$('<label/>', {for:'gen_lower_popup',text:t('passwords', 'Lowercase characters')}).appendTo($('#popupContent'));
			$('<br/>').appendTo($('#popupContent'));
			
			$('<input>', {type:'checkbox', id:"gen_upper_popup"}).prop("checked", $('#gen_upper').is(":checked")).appendTo($('#popupContent'));
			$('<label/>', {for:'gen_upper_popup',text:t('passwords', 'Uppercase characters')}).appendTo($('#popupContent'));
			$('<br/>').appendTo($('#popupContent'));
			
			$('<input>', {type:'checkbox', id:"gen_numbers_popup"}).prop("checked", $('#gen_numbers').is(":checked")).appendTo($('#popupContent'));
			$('<label/>', {for:'gen_numbers_popup',text:t('passwords', 'Numbers')}).appendTo($('#popupContent'));
			$('<br/>').appendTo($('#popupContent'));
			
			$('<input>', {type:'checkbox', id:"gen_special_popup"}).prop("checked", $('#gen_special').is(":checked")).appendTo($('#popupContent'));
			$('<label/>', {for:'gen_special_popup',text:t('passwords', 'Punctuation marks')}).appendTo($('#popupContent'));
			$('<br/>').appendTo($('#popupContent'));
			
			$('<input/>', {type:'text', id:"gen_length_popup", value:$('#gen_length').val()}).appendTo($('#popupContent'));
			$('<label/>', {text:t('passwords', 'characters')}).appendTo($('#popupContent'));
			$('<br/>').appendTo($('#popupContent'));
			
			$('<button/>', {id:'new_generate_popup', text:t('passwords', 'Generate password')}).appendTo($('#popupContent'));	
			$('<br/>').appendTo($('#popupContent'));

		} else if (type == 'website') {
			$('<br/><br/>').appendTo($('#popupContent'));
			$('<p/>', {text:t('passwords', 'Full URL (optional)') + ':'}).appendTo($('#popupContent'));
			$('<input/>', {type:'text', id:"new_address_popup", autocorrect:'off', autocapitalize:'off', spellcheck:'false'}).val(address_value).appendTo($('#popupContent'));
			$('<p/>', {id:"popupInvalid", text:t('passwords', 'Fill in a valid URL.') + ' ' + t('passwords', 'Note: This field is optional and can be left blank.')}).appendTo($('#popupContent'));
		}

		if (type == 'website' || type == 'loginname' || type == 'password') {
			$('<input>', {type:'checkbox', id:"keep_old_popup"}).prop("checked", 'true').appendTo($('#popupContent'));
			$('<label/>', {for:'keep_old_popup', id:"keep_old_popuplbl", text:t('passwords', 'Move old value to trash bin')}).appendTo($('#popupContent'));
		}

	}

	$('<div/>', {id: 'popupButtons'}).appendTo($('#popup'));	
	$('<button/>', {id:'cancel', text:t('passwords', 'Cancel')}).appendTo($('#popupButtons'));
	$('<button/>', {id:'accept', text:t('passwords', 'Save')}).appendTo($('#popupButtons'));

	// Popup
	$('#overlay').click(function() {
		$('#overlay').remove();
		$('#popup').remove();
	});
	$('#cancel').click(function() {
		$('#overlay').remove();
		$('#popup').remove();
	});
	if (type == 'password') {
		strength_str($("#new_value_popup").val(), false);
		$('#generate_strength').text('');
		$('#generate_passwordtools').hide();

		$("#new_value_popup").keyup(function() {
			strength_str(this.value, false);
			$('#generate_strength').text('');
		});
		$('#gen_lower_popup').change(function() {
			$('#gen_lower').prop("checked", $('#gen_lower_popup').is(":checked"));
		});
		$('#gen_upper_popup').change(function() {
			$('#gen_upper').prop("checked", $('#gen_upper_popup').is(":checked"));
		});
		$('#gen_numbers_popup').change(function() {
			$('#gen_numbers').prop("checked", $('#gen_numbers_popup').is(":checked"));
		});
		$('#gen_special_popup').change(function() {
			$('#gen_special').prop("checked", $('#gen_special_popup').is(":checked"));
		});
		$('#gen_length_popup').change(function() {
			$('#gen_length').val($('#gen_length_popup').val());
		});
		$('#new_generate_popup').click(function() {
			$('#new_generate').click();
		});
	}

	// no focus, too annoying for iPad and iPhone
	// $('#new_value_popup').focus();
	// $('#new_value_popup').select();

	// align to vertical center
	var popupHeight = document.getElementById('popup').clientHeight;
	var browserHeight = Math.max(
		document.body.scrollHeight, document.documentElement.scrollHeight,
		document.body.offsetHeight, document.documentElement.offsetHeight,
		document.body.clientHeight, document.documentElement.clientHeight
	);
	if (browserHeight > popupHeight) {
		document.getElementById("popup").style.top = (browserHeight - popupHeight) / 4 + "px";	
	}

	$('#popupTitle').click(); // for deactivating the active row
	
}
function trashAllPasswords(Passwords) {

	var passwords = new Passwords(OC.generateUrl('/apps/passwords/passwords'));
	var doneTotal = 0;

	$('#PasswordsTableContent tbody tr').each(function() {
		var $row = $(this);
		var $cell = $row.closest('td.icon-info');
		if (!$row.hasClass('is_deleted')) {
			var success = passwords.updateActive($row.attr('attr_id'), $row.attr('attr_loginname'), $row.attr('attr_website'), $row.attr('attr_address'), $row.attr('attr_pass'), $row.attr('attr_notes'), $row.attr('attr_category'), '1');
			if (success) {
				doneTotal++;
				$row.attr('class', 'is_deleted');
				$cell.removeClass('icon-info');
				$cell.addClass('icon-history');
				$row.hide();
				formatTable(true);
			} else {
				OCdialogs.alert(t('passwords', 'Error: Could not update password.'), t('passwords', 'Save'), null, true);
			}
		}
	});

	if (doneTotal > 0) {
		OCdialogs.info(t('passwords', 'All passwords were moved to the trash bin.'), t('passwords', 'Trash bin'), null, true);
	} else {
		OCdialogs.info(t('passwords', 'There are no passwords to be moved.'), t('passwords', 'Trash bin'), null, true);
	}
}
function showSidebar($row) {
	
	$('#app-content-wrapper').attr('class', 'content-wrapper-sidebar');

	// set top relatively to header (adaptive to future header changes by core team, or for skin users)
	document.getElementById('app-sidebar-wrapper').style.top = document.getElementById('header').clientHeight + 35 + 'px';

	$('#app-sidebar-wrapper').show(200);
	$('#sidebarRow').val($row.attr('attr_id'));

	$('#sidebarWebsite').text($row.attr('attr_website'));
	$('#sidebarAddress').text($row.attr('attr_address'));
	if ($('#sidebarAddress').text() == '') {
		$('#sidebarAddress').text('(' + t('passwords', 'None') + ')');
	}
	$('#sidebarUsername').text($row.attr('attr_loginname'));

	$('#sidebarLength').text($row.attr('attr_length'));

	$('#sidebarStrength').text($row.attr('attr_strength'));

	$('#sidebarStrength').attr('class', strength_str2class($row.attr('attr_strength')));
	$('#sidebarStrength').addClass('rightCol');

	var lower = bool2class_str($row.attr('attr_lower'));
	$('#sidebarLower').attr('class', lower[0]);
	$('#sidebarLower').text(lower[1]);
	$('#sidebarLower').addClass('rightCol');

	var upper = bool2class_str($row.attr('attr_upper'));
	$('#sidebarUpper').attr('class', upper[0]);
	$('#sidebarUpper').text(upper[1]);
	$('#sidebarUpper').addClass('rightCol');

	var number = bool2class_str($row.attr('attr_number'));
	$('#sidebarNumber').attr('class', number[0]);
	$('#sidebarNumber').text(number[1]);
	$('#sidebarNumber').addClass('rightCol');

	var special = bool2class_str($row.attr('attr_special'));
	$('#sidebarSpecial').attr('class', special[0]);
	$('#sidebarSpecial').text(special[1]);
	$('#sidebarSpecial').addClass('rightCol');

	var d = new Date($row.attr('attr_datechanged'));
	$('#sidebarChanged').html(date2str(d, false) + ' (' + date2str(d, true) + ')');
	$('#sidebarChanged').attr('class', date2class(d));
	$('#sidebarChanged').addClass('rightCol');

	$('#sidebarNotes').text($row.attr('attr_notes'));
	if ($('#sidebarNotes').text() == '') {
		$('#sidebarNotes').text('(' + t('passwords', 'None') + ')');
	}

	var cat_attribute = $row.attr('attr_category');
	$('#sidebarCategories').text('');
	$('#CategoriesTableContent tr').each(function() {
		var cat_id = $(this).find('.catTable_id').text();
		if (cat_id == cat_attribute) {
			var cat_name = $(this).find('.catTable_name').text();
			$('#sidebarCategories').text(cat_name);
		}
	});
	if ($('#sidebarCategories').text() == '') {
		$('#sidebarCategories').text('(' + t('passwords', 'None') + ')');
	}

}
function resetTimer(kill_old) {

	var settimer = $('#app-settings').attr('timer');
	var session_timeout = $('#app-settings').attr('session-timeout');

	$('#idleTimer').show(500);
	$('#outerRing').show(500);

	$('#countSec').text(int2time(settimer, false));

	if (settimer < 61) {
		$('#countSec').css('font-size', '30px');
	} else {
		$('#countSec').css('font-size', '16px');
	}

	if (kill_old) {
		clearInterval(intervalID);
	}

	intervalID = setInterval(function() {
		settimer = settimer - 1;
		session_timeout = session_timeout - 1;

		$('#countSec').text(int2time(settimer, false));
		$('#session_lifetime').text(session_timeout);

		if (settimer < 61) {
			$('#countSec').css('font-size', '30px');
		} else {
			$('#countSec').css('font-size', '16px');
		}
		// kill on 0, 'click' on logoff entry in top right menu
		if (settimer == 0 || session_timeout == 0) {
			$('#PasswordsTable table td').hide();
		}
		if (settimer == -1) {
			clearInterval(intervalID);
			alert(t('passwords', 'You will be logged off due to inactivity of %s seconds.').replace('%s', $('#app-settings').attr('timer')));
			//window.location = document.getElementById('logout').href;
		}
		if (session_timeout == -1) {
			alert(t('passwords', 'You will be logged off due to expiration of your session cookie (set to %s minutes).').replace('%s', int2time($('#app-settings').attr('session-timeout'), true)));
			//window.location = document.getElementById('logout').href;
		}
	}, 1000);

}
function int2time(integer, always_as_minutes) {
	if (integer < 61 && !always_as_minutes) {
		return integer;
	} else {
		return new Date(null, null, null, null, null, integer).toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0].substr(3, 5);
	}
}
function getContrastYIQ(hexcolor) {
	// adapted from https://24ways.org/2010/calculating-color-contrast
	// this great function converts RGB into YIQ first: https://en.wikipedia.org/wiki/YIQ
	if (hexcolor.length == 3) {
		// convert #eee to #eeeeee
		hexcolor = hexcolor.substr(0, 1) + hexcolor.substr(0, 1)
			+ hexcolor.substr(1, 1) + hexcolor.substr(1, 1)
			+ hexcolor.substr(2, 1) + hexcolor.substr(2, 1);
	}
	var r = parseInt(hexcolor.substr(0, 2), 16);
	var g = parseInt(hexcolor.substr(2, 2), 16);
	var b = parseInt(hexcolor.substr(4, 2), 16);
	var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
	return (yiq >= 128) ? '000000' : 'ffffff';
}

// the following functions are needed to update the 
// database for users with version older than v17
// (encrypt loginname, address and password properties)
function updateRequired() {
	$('#section_update').show();
	$('#section_table').hide();
	$('#section_categories').hide();
}
function updateStart(passwords) {

	$('#update_start_btn').hide();
	$('#update_progress').show();

	var table = document.getElementById('PasswordsTableTestOld');
	// initiate progress bar
	$('#update_progress_active').val(0);
	$('#update_progress_total').val(table.rows.length);
	var done = ($('#update_progress_active').val() / $('#update_progress_total').val()) * 100;
	$('#update_progress_done').css('width', done + '%');
	$('#update_progress_text').text($('#update_progress_active').val() + ' / ' + $('#update_progress_total').val() + ' (' + Math.round(done) + '%)')

	var all_success = true;

	for (var i = 0; i < table.rows.length; i++) {

		//setTimeout(function() {
			// update progress bar
			$('#update_progress_active').val(i + 1);
			done = ($('#update_progress_active').val() / $('#update_progress_total').val()) * 100;
			// if (done == 100) {
			// 	done = 99; // else people might reload the page manually, without button
			// }
			$('#update_progress_done').css('width', done + '%');
			$('#update_progress_text').text($('#update_progress_active').val() + ' / ' + $('#update_progress_total').val() + ' (' + Math.round(done) + '%)')
		//}, 500);

		var website = table.rows[i].cells[0].textContent;
		var loginname = table.rows[i].cells[1].textContent;
		var pass = table.rows[i].cells[2].textContent;
		var creation_date = table.rows[i].cells[4].textContent;
		var db_id = table.rows[i].cells[5].textContent;
		var address = table.rows[i].cells[7].textContent;
		var notes = table.rows[i].cells[8].textContent;
		var deleted = table.rows[i].cells[9].textContent;

		if (loginname != '') {
			var success = passwords.updateActive(db_id, loginname, website, address, pass, notes, 0, deleted, creation_date);
			if (!success) {
				all_success = false;
			}
		}
	}

	setInterval(function() {
		if (all_success && done == 100) {
			$('#update_progress').hide();
			$('#update_done').show();
			$('#update_done_btn').click(function() {
				location.reload(true);
			});
		} else if (done == 100) {
			alert(t('passwords', 'Error: Could not update password.'));
		}
	}, 1000);

}
function updateDone() {
	$('#section_update').hide();
	$('#section_table').show();
	$('#section_categories').show();
}
function isFlashEnabled() {
	var hasFlash = false;
	try	{
		var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
		if (fo) {
			hasFlash = true;
		}
	}
	catch (e) {
		if (navigator.mimeTypes ["application/x-shockwave-flash"] != undefined) {
			hasFlash = true
		}
	}
	return hasFlash;
}
