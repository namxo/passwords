# Passwords
#### for ownCloud Server 8 and 9
##### 2015-2016, Fallon Turner <fcturner@users.noreply.github.com>
Available in languages: 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/uksmall.gif" title="English" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/desmall.gif" title="German" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/essmall.gif" title="Spanish" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/frsmall.gif" title="French" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/itsmall.gif" title="Italian" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/nlsmall.gif" title="Dutch" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/dksmall.gif" title="Danish" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/czsmall.gif" title="Czech" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/nosmall.gif" title="Norwegian Bokmål" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/rusmall.gif" title="Russian" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/plsmall.gif" title="Polish" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/brsmall.gif" title="Portuguese (Brazil)" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/ptsmall.gif" title="Portuguese (Portugal)" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/trsmall.gif" title="Turkish" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/svsmall.gif" title="Swedish" height="15" /> 
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Catalonia.svg/150px-Flag_of_Catalonia.svg.png" title="Catalan" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/ilsmall.gif" title="Hebrew" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/rosmall.gif" title="Romanian" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/alsmall.gif" title="Albanian" height="15" /> 
<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/issmall.gif" title="Icelandic" height="15" /> 
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Galicia.svg/150px-Flag_of_Galicia.svg.png" title="Galician" height="15" />  

[View this app on apps.owncloud.org.](https://apps.owncloud.com/content/show.php/Passwords?content=170480)

###### This app cannot be installed from within ownCloud, since this system demands repackaging of releases and kills the possibility to freely use GitHub master versions. (read more below under Installation)

#### Overview
:camera: [More pictures in the gallery](https://github.com/fcturner/passwords/wiki/ownCloud-Passwords-%7C-Gallery-(screenshots)).
![Overview of ownCloud Passwords](img/screenshot3.PNG)

:camera: [More pictures in the gallery](https://github.com/fcturner/passwords/wiki/ownCloud-Passwords-%7C-Gallery-(screenshots)).

## Summary
This is a Password Manager for generating, **SHARING**, editing, and categorizing passwords in ownCloud 8 and ownCloud 9 ([see 'img'-folder](/img/) for screenshots or [here for the gallery](https://github.com/fcturner/passwords/wiki/ownCloud-Passwords-%7C-Gallery-(screenshots))). It features **both client side and server side encryption** (using combined EtM [Encrypt-then-MAC] and MCRYPT_BLOWFISH encryption with user-specific, ownCloud-specific, and database entry-specific data), where only the user who creates the password is able to decrypt and view it. So passwords are stored heavily encrypted into the ownCloud database (read [Security part](https://github.com/fcturner/passwords#security) for details). You can insert or import your own passwords or randomly generate new ones. Some characters are excluded upon password generation for readability purposes (1, I, l and B, 8 and o, O, 0).

This app is primarily intended as a password MANAGER, e.g. for a local ownCloud instance on your own WPA2 protected LAN. If you trust yourself enough as security expert, you can use this app behind an SSL secured server for a neat cloud solution. The app will be blocked (with message) if not accessed thru https, which will result in your passwords not being loaded (decrypted) and shown. To prevent this, use ownClouds own 'Force SSL'-function on the admin page, or use HSTS (HTTP Strict Transport Security) on your server. Also, make sure your server hasn't any kind of vulnerabilities (POODLE, CSRF, XSS, SQL Injection, Privilege Escalation, Remote Code Execution, to name a few).

The script for creating passwords can be found in [`/js/script.js`](/js/script.js#L1705-L1784).

## Security
### + Password generation
Generated passwords are in fact pseudo-generated (i.e. not using atmospheric noise), since only the Javascript Math.random-function is used, of which I think is randomly 'enough'. After generation of different types of characters (your choice to include lowercase, uppercase, numbers and/or reading marks, strength will be calculated), scrambling of these characters is done using the [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) (also known as Knuth, a de-facto unbiased shuffle algorithm).

### + Encryption (for storage in database)
This app features both **server-side encryption** (since encryption takes place on the server, before the data is placed in the database table) and **client-side encryption** (since encryption is performed with a key that is not known to the server). All passwords (generated or your own) are stored into your own ownCloud database, using these high-end cryptological functions:
* Encryption is done using a key built from user-specific, ownCloud-specific, and database entry-specific data so it is unique for every encrypted block of text (i.e. every password). It therefore provides key rotation for cipher and authentication keys.
* The keys are not used directly. Instead, it uses [key stretching](http://en.wikipedia.org/wiki/Key_stretching) which relies on [Password-Based Key Derivation Function 2](http://en.wikipedia.org/wiki/PBKDF2) (PBKDF2).
* It uses [Encrypt-then-MAC](http://en.wikipedia.org/wiki/Authenticated_encryption#Approaches_to_Authenticated_Encryption) (EtM), which is a very good method for ensuring the authenticity of the encrypted data.
* It uses mcrypt to perform the encryption using [MCRYPT_BLOWFISH ciphers](https://en.wikipedia.org/wiki/Blowfish_(cipher)) and [MCRYPT_MODE_CBC](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_.28CBC.29) for the mode. It's strong enough, and still fairly fast.
* It hides the [Initialization vector](http://en.wikipedia.org/wiki/Initialization_vector) (IV).
* It uses a [timing-safe comparison](http://blog.ircmaxell.com/2014/11/its-all-about-time.html) function using [double Hash-based Message Authentication Code](http://en.wikipedia.org/wiki/Hash-based_message_authentication_code) (HMAC) verification of the source data.

### + Decryption (for pulling from database)
All passwords are encrypted with user-specific, ownCloud-specific and server-specific keys. This means passwords can be decrypted:
* only by the user who created the password (so this user must be logged in),
* only on the same ownCloud instance where the password was created in (meaning: same password salt in config.php).

Other users or administrators are never able to decrypt passwords, since they cannot login as the user (assuming the user's password isn't known). *If the password salt is lost, all passwords of all users are lost and irretrievable.*

### + Sharing
For sharing, an ad hoc share key is created everytime a share is initiated. This is a 256-bit strong hash, with no retrievable information. The share key is stored encrypted as above for the user who shares a password and copied to another table where this key matches the password ID and the ownCloud ID of the user to whom the password is shared with. If the share keys match, the password will be decrypted at the receiving user's side too. If they don't, the receiving user will see an 'Invalid share key' notice and the password will not be decrypted at all.

## Remote control
This app allows full remote control by using a RESTful API. Read here about how to use it: https://github.com/fcturner/passwords/wiki.

Browser plugins are available for [Firefox here](https://addons.mozilla.org/en-US/firefox/addon/firefox-owncloud-passwords) (thanks to [@eglia](https://github.com/eglia)) and for [Chrome here](https://github.com/thefirstofthe300/ownCloud-Passwords) (thanks to [@thefirstofthe300](https://github.com/thefirstofthe300)).

## Website icons
There is a built in option to view website icons in the password table. This can be set by the administrator on the settings page of ownCloud. The admin has two services to choose from: DuckDuckGo (default) and Google. Icons are downloaded from their secured server when a user loads the page. Nothing fancy or unsafe (even using Google... although [they track you](http://donttrack.us)), it's just about icons. The icon for the ownCloud's website for example (replace *owncloud.org* with your own domain to try): 
* [https://icons.duckduckgo.com/ip2/owncloud.org.ico](https://icons.duckduckgo.com/ip2/owncloud.org.ico) (32x32 pixels)
* [https://www.google.com/s2/favicons?domain=owncloud.org](https://www.google.com/s2/favicons?domain=owncloud.org) (16x16 pixels)

## Translations
ownCloud Passwords is available in:

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/uksmall.gif" height="16" /> English

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/desmall.gif" height="20" /> German

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/essmall.gif" height="20" /> Spanish

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/frsmall.gif" height="20" /> French

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/itsmall.gif" height="20" /> Italian

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/nlsmall.gif" height="20" /> Dutch

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/dksmall.gif" height="20" /> Danish

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/czsmall.gif" height="20" /> Czech

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/nosmall.gif" height="23" /> Norwegian Bokmål

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/rusmall.gif" height="23" /> Russian

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/plsmall.gif" height="20" /> Polish

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/brsmall.gif" height="20" /> Portuguese (Brazil)

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/ptsmall.gif" height="20" /> Portuguese (Portugal)

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/trsmall.gif" height="20" /> Turkish

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/svsmall.gif" height="20" /> Swedish

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Catalonia.svg/150px-Flag_of_Catalonia.svg.png" height="20" /> Catalan

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/ilsmall.gif" height="20" /> Hebrew

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/rosmall.gif" height="20" /> Romanian

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/alsmall.gif" height="20" /> Albanian

<img src="http://www.worldatlas.com/webimage/flags/countrys/zzzflags/issmall.gif" height="20" /> Icelandic

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Galicia.svg/150px-Flag_of_Galicia.svg.png" height="20" /> Galician

## Installation
Use one of the following options, login as admin on ownCloud and enable the app. The database tables `oc_passwords`, `oc_passwords_categories` and `oc_passwords_share` will be created automatically (assuming `_oc` as prefix).
* **Manual download and installation** 
 * [Click here to view the latest official release](https://github.com/fcturner/passwords/releases/latest) or, for the very last master version, [click here to download the zip](https://github.com/fcturner/passwords/archive/master.zip) or [here to download the tar.gz](https://github.com/fcturner/passwords/archive/master.tar.gz).
 * Copy, unzip or untar the folder 'passwords' to /owncloud/apps/ (**remember that the folder must be called 'passwords'**).
* **Git clone** 
 * Use the command 
 ```
git clone https://github.com/fcturner/passwords.git /var/www/owncloud/apps/passwords
```
(assuming `/var/www/owncloud` as your ownCloud root location).
* **ownCloud App store** 
 * I refuse to support this. This system demands repackaging of releases and kills the possibility to freely use GitHub master versions. Repackaging of releases is prone to human error and, more importantly, adds invisible system files to a release when doing this on Mac (like `.DS_Store`) and Windows (like `Thumbs.db`). This means local user properties and file system info (**privacy sensitive possibly**) are sent to a server, which **should be avoided at all costs**. Did you know forensic scientists can use these files against you? You surely don't want them on any server, any cloud, or anywhere on the internet! Dr Sarah Morris and Dr Howard Chivers [wrote an article about this](http://www.identatron.co.uk/wp-content/uploads/2013/11/cyberforensics2013.pdf). The ownCloud team should really alter the behaviour of ownCloud pulling apps from their app store, instead of letting app developers interfere with a decent, solid and closed GitHub workflow (as I've been telling them for months). **This app is all about privacy and security, the ownCloud app store apparently isn't.**

## Credits
A big thanks to all participants in this project. I thank Anthony Ferrara ([ircmaxell](http://careers.stackoverflow.com/ircmaxell)), for [teaching the world how to properly set up](http://stackoverflow.com/questions/5089841/two-way-encryption-i-need-to-store-passwords-that-can-be-retrieved/5093422#5093422) security in PHP.
